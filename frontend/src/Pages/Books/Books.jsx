import { useNavigate } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';
import { useState, useEffect, useContext } from 'react';
import { getBooks, borrowBook, buildImageUrl } from '../../api/client';
import { tokenContext } from '../../Context/TokenContext';

export default function Books() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [borrowStatus, setBorrowStatus] = useState({});
  const navigate = useNavigate();
  const { token } = useContext(tokenContext);

  useEffect(() => {
    document.title = "Books";
    loadBooks();
  }, []);

  const loadBooks = async (term = searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBooks(term.trim() ? { q: term.trim() } : {});
      setBooks(data || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to load books right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setBorrowStatus((prev) => ({ ...prev, [bookId]: 'loading' }));
    try {
      await borrowBook(bookId);
      setBorrowStatus((prev) => ({ ...prev, [bookId]: 'success' }));
    } catch (err) {
      setBorrowStatus((prev) => ({ ...prev, [bookId]: 'error' }));
      setError(err?.response?.data?.error || "Unable to borrow this book.");
    }
  };

  return (
    <>
      <div className="w-full flex justify-center mb-6 mt-6 gap-2">
        <input
          type="text"
          placeholder="Search books..."
          className="border border-gray-300 rounded-lg p-2 w-2/4 text-center focus:outline-none focus:border-blue-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => loadBooks(searchTerm)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-800"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="w-full text-center text-blue-700">Loading books...</div>
      )}
      {error && !loading && (
        <div className="w-full text-center text-red-600 mb-4">{error}</div>
      )}

      <div className='flex flex-wrap justify-center'>
        {!loading && books.map((item) => {
          const typeLabel = item.material_type === 'POEM' ? 'Poem' : 'Book';
          const imageUrl = buildImageUrl(item.image_path);
          const description = item.description || '';
          return (
          <div key={item.id} className='w-full sm:w-full md:w-1/2 lg:w-2/6 p-3 '>
            <div className="bg-white border border-main rounded-lg shadow-sm hover:shadow-2xl dark:bg-gray-800 dark:border-gray-700">
              {imageUrl && (
                <img className="rounded-t-lg w-full h-[200px] object-cover" src={imageUrl} alt={item.title} />
              )}
              <div className="p-5">
                <div className="flex justify-between text-blue-700 items-center text-l font-medium px-1.5 py-0.5">
                  <FaBook />
                  <span>{typeLabel}</span>
                </div>
                <h5 className="mt-3 mb-3 text-2xl text-center text-blue-700 font-semibold tracking-tight text-heading">
                  {item.title}
                </h5>
                {description && (
                  <p className="mb-3 text-sm text-gray-600">{description}</p>
                )}
                <p className="mb-2 text-sm text-gray-600">
                  Copies available: {item.available_copies ?? '-'} / {item.total_copies ?? '-'}
                </p>
                {item.shelf_location && (
                  <p className="mb-3 text-sm text-gray-600">Shelf: {item.shelf_location}</p>
                )}
                <div className="flex flex-col gap-2">
                  <a
                    href={item.external_link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-white w-full mb-2 bg-blue-600 p-2 rounded-lg text-center ${item.external_link ? 'hover:bg-blue-800' : 'opacity-60 cursor-not-allowed'}`}
                  >
                    {item.external_link ? 'Read More' : 'No Link Available'}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleBorrow(item.id)}
                    disabled={borrowStatus[item.id] === 'loading'}
                    className="text-white w-full bg-green-600 p-2 rounded-lg hover:bg-green-800 disabled:bg-green-300"
                  >
                    {borrowStatus[item.id] === 'loading' ? 'Borrowing...' : 'Borrow'}
                  </button>
                  {borrowStatus[item.id] === 'success' && (
                    <small className="text-green-600">Borrowed successfully.</small>
                  )}
                  {borrowStatus[item.id] === 'error' && (
                    <small className="text-red-600">Borrow failed.</small>
                  )}
                </div>
              </div>
            </div>
          </div>
        )})}

        {!loading && books.length === 0 && (
          <div className="w-full text-center mt-10 text-red-600 text-xl font-semibold">
            No books found right now.
          </div>
        )}
      </div>
    </>

  )
}
