import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuthors, buildImageUrl } from '../../api/client';

export default function Authors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Authors";
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuthors();
      setAuthors(data || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to load authors right now.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = authors.filter((author) =>
    (author.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="w-full flex justify-center mb-6 mt-6 gap-2">
        <input
          type="text"
          placeholder="Search authors..."
          className="border border-gray-300 rounded-lg p-2 w-2/4 text-center focus:outline-none focus:border-blue-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {}}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-800"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="w-full text-center text-blue-700">Loading authors...</div>
      )}
      {error && !loading && (
        <div className="w-full text-center text-red-600 mb-4">{error}</div>
      )}

      <div className="w-full flex flex-wrap justify-center mb-6 mt-6 gap-2">
        {!loading && filtered.map((author) => {
          const imageUrl = buildImageUrl(author.image_path);
          return (
          <div key={author.id} className='w-full sm:w-full md:w-1/2 lg:w-2/6 p-3 cursor-pointer'>
            <Link to={author.wikipedia_url || '#'}>
              <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={author.name}
                      className="w-full h-[300px] object-cover rounded-t-xl transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-[300px] bg-gray-200 rounded-t-xl flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-t-xl"></div>
                </div>
                <div className="p-6">
                  <h5 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">
                    Name: <span className='text-black dark:text-white'>{author.name}</span>
                  </h5>
                  <h5 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">
                    Born: <span className='text-black dark:text-white'>{author.born_raw || '—'}</span>
                  </h5>
                  {author.bio && (
                    <p className="text-black dark:text-gray-300 text-sm mb-4">
                      <span className='text-blue-700'> About: </span> {author.bio}
                    </p>
                  )}

                  <button
                    type="button"
                    className={`w-full py-2 px-4 rounded-lg ${author.wikipedia_url ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  >
                    {author.wikipedia_url ? 'Read More' : 'No Link Available'}
                  </button>
                </div>
              </div>
            </Link>
          </div>
        )})}
        {!loading && filtered.length === 0 && searchTerm !== '' && (
            <div className="w-full text-center mt-10 text-red-600 text-xl font-semibold">
              Sorry, this author has no information in Alex Library right now.
            </div>
          )}
      </div>
    </>
  )
}
