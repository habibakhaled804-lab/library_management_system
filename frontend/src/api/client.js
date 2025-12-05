import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function buildImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return `${API_BASE_URL}/${imagePath}`;
}

export function setAuthUserId(userId) {
  if (userId) {
    api.defaults.headers.common['x-user-id'] = String(userId);
  } else {
    delete api.defaults.headers.common['x-user-id'];
  }
}

export function loginUser(email, password) {
  return api.post('/auth/login', { email, password }).then((res) => res.data);
}

export function registerUser({ name, email, password }) {
  return api.post('/auth/register', { name, email, password }).then((res) => res.data);
}

export function getBooks(params = {}) {
  return api.get('/books', { params }).then((res) => res.data);
}

export function getBook(id) {
  return api.get(`/books/${id}`).then((res) => res.data);
}

export function getAuthors() {
  return api.get('/authors').then((res) => res.data);
}

export function getAuthor(id) {
  return api.get(`/authors/${id}`).then((res) => res.data);
}

export function borrowBook(bookId) {
  return api.post('/loans', { book_id: bookId }).then((res) => res.data);
}

export default api;
