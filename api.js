const API_URL = 'http://localhost:3000';
async function handleResponse(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        throw new Error(`Server returned HTML: ${text.slice(0, 100)}...`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('authChange'));
        }
        throw new Error(data.error || 'Request failed');
    }
    
    return data;
}

export async function register(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function login(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}
export async function checkEmail(email) {
    if (!email || typeof email !== 'string') {
        throw new Error('Invalid email parameter');
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/check-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }) 
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('Email check failed:', error);
        throw new Error('Не удалось проверить email. Пожалуйста, попробуйте позже.');
    }
}
export async function resetPassword(data) {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await handleResponse(response);
        
        if (!responseData.success) {
            throw new Error(responseData.error || 'Ошибка при сбросе пароля');
        }
        
        return responseData;
    } catch (error) {
        console.error('Reset password failed:', error);
        throw new Error('Не удалось сбросить пароль. Пожалуйста, попробуйте позже.');
    }
}

export async function sendSupportRequest(data) {
  const response = await fetch(`${API_URL}/api/support`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}
const defaultOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
};
export async function fetchRestaurants() {
  try {
    console.log('Запрос ресторанов...');
    const response = await fetch(`${API_URL}/api/restaurants`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Ожидался массив ресторанов');
    }
    
    return data;
  } catch (error) {
    console.error('Ошибка в fetchRestaurants:', error);
    throw error;
  }
}

export async function fetchRestaurantById(id) {
  try {
    if (!id || isNaN(id)) {
      throw new Error('Invalid restaurant ID');
    }
    
    const response = await fetch(`${API_URL}/api/restaurants/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Restaurant not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
}

export async function fetchRestaurantMenu(restaurantId) {
  if (!restaurantId) throw new Error('No restaurant ID provided');
  const response = await fetch(`${API_URL}/api/restaurants/${restaurantId}/menu`);
  return handleResponse(response);
}
export async function refreshToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Ошибка обновления токена');
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Refresh token failed:', error);
    return null;
  }
}