import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Link: Allows users to navigate to different routes (pages) in the application without a full page reload
import { getAuthors, buildImageUrl } from '../../api/client'; 
// for data fetching and image path construction from a custom API client file

export default function Authors() {
  const [searchTerm, setSearchTerm] = useState('');
  // Initializes searchTerm with an empty string into the search box
  const [authors, setAuthors] = useState([]);
  // State to hold the list of author data fetched from the API and intializes authors with an empty array
  const [loading, setLoading] = useState(false);
  // loading: A boolean (true/false) flag to show a "Loading..." message.
  const [error, setError] = useState(null);
  // error: Stores a string message if the API call fails.

  useEffect(() => {
    document.title = "Authors";
    // Calls the function to fetch the authors data
    loadAuthors();
  }, []); // The empty dependency array `[]` ensures this runs only once

  const loadAuthors = async () => {
    setLoading(true);
    setError(null); 
    // Asynchronous function to handle the fetching of author data, Set the loading state to true to show the loading indicator and null to clear any previous error messages
    try {
      const data = await getAuthors();
      setAuthors(data || []); // Update the authors state with the fetched data (or an empty array if data is null/undefined)
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to load authors right now.");
    } finally {
      setLoading(false); // This block always runs after try/catch, regardless of success or failure and false to break the loop and finish the loading phase
    }
  };
// Filters the full list of authors based on the search term
  const filtered = authors.filter((author) =>
    (author.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ); // This creates a new array (`filtered`) containing only the authors whose names match the search input.

  // Rendering or what user sees (JSX)
  return ( 
    <>
      <div className="w-full flex justify-center mb-6 mt-6 gap-2">
        <input
          type="text"
          placeholder="Search authors..."
          className="border border-gray-300 rounded-lg p-2 w-2/4 text-center focus:outline-none focus:border-blue-600"
          value={searchTerm} // Sets the input's current value to the 'searchTerm' state
          onChange={(e) => setSearchTerm(e.target.value)} // Updates the 'searchTerm' state every time the user types a character
        />
        <button
          onClick={() => {}}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-800"
        >
          Search
        </button>
      </div>
// Conditional Rendering: Display the loading message only if 'loading' is true 
      {loading && (
        <div className="w-full text-center text-blue-700">Loading authors...</div>
      )}
      // Display the error message only if 'error' is present AND we're not loading */}
      {error && !loading && (
        <div className="w-full text-center text-red-600 mb-4">{error}</div>
      )}

      <div className="w-full flex flex-wrap justify-center mb-6 mt-6 gap-2">
        {!loading && filtered.map((author) => {
          const imageUrl = buildImageUrl(author.image_path); // Construct the full image URL using the utility function and the author's image path
          return (
          <div key={author.id} className='w-full sm:w-full md:w-1/2 lg:w-2/6 p-3 cursor-pointer'> // key prop is required by React when rendering a list, it helps React efficiently update the list
            <Link to={author.wikipedia_url || '#'}> //Link component makes the entire card clickable TO NAVIGATE author's wikipedia URL
              <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative"> 
                  {imageUrl ? (  //C onditional Rendering: Check if an image URL exists
                    <img
                      src={imageUrl}
                      alt={author.name}
                      className="w-full h-[300px] object-cover rounded-t-xl transition-transform duration-300 hover:scale-105" //Dislay image
                    />
                  ) : (
                    <div className="w-full h-[300px] bg-gray-200 rounded-t-xl flex items-center justify-center text-gray-500">
                      No image // Display a placeholder if no image URL is available
                    </div>
                  )} 
                  // Overlay for visual effect on hover
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-t-xl"></div>
                </div>
                <div className="p-6">
                  <h5 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">
                    Name: <span className='text-black dark:text-white'>{author.name}</span>
                  </h5> //Conditional Rendering: Display Bio only if it exists
                  <h5 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3">
                    Born: <span className='text-black dark:text-white'>{author.born_raw || '—'}</span>
                  </h5>
                  {author.bio && (
                    <p className="text-black dark:text-gray-300 text-sm mb-4">
                      <span className='text-blue-700'> About: </span> {author.bio}
                    </p>
                  )}
// Read More Button that links to Wikipedia
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
              Sorry, this author has no information in Alex Library right now. // a conditional check that displays a "Sorry, no information..." message if the filtered list is empty after a user has searched.
            </div>
          )}
      </div>
    </>
  )
}
