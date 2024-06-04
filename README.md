# Open Library Dashboard

This project is a web application that displays a dashboard of science fiction books fetched from the Open Library API. It allows users to search, edit, paginate, and download book data in CSV format.

## Features

- **Fetch and Display Books**: Retrieves a list of science fiction books from the Open Library API and displays them in a table.
- **Search**: Allows users to search for books by author name.
- **Edit**: Users can edit book information directly in the table.
- **Pagination**: Supports pagination to navigate through the list of books.
- **Sorting**: Allows sorting of columns in ascending or descending order.
- **Download CSV**: Provides the functionality to download the book data as a CSV file.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/open-library-dashboard.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd open-library-dashboard
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Run the application**:
    ```bash
    npm start
    ```

## Usage

1. **View Books**: Upon loading, the application fetches and displays a list of science fiction books.
2. **Search**: Use the search bar at the top to filter books by author name.
3. **Edit Books**: Click the "Edit" button in the Actions column to edit a book's information. After editing, click "Save" to update the book or "Cancel" to discard changes.
4. **Pagination**: Use the pagination controls at the bottom of the table to navigate through different pages of the book list.
5. **Sorting**: Click on the column headers to sort the books by that column in ascending or descending order.
6. **Download CSV**: Click the "Download CSV" button to download the book data as a CSV file.

## Code Overview

- **Dependencies**:
  - `react`: JavaScript library for building user interfaces.
  - `axios`: Promise-based HTTP client for making API requests.
  - `react-table`: Hooks for building fast and extendable tables and datagrids.
  - `file-saver`: Library to save files on the client-side.
  
- **Main Components**:
  - `Dashboard`: The main component that manages the state, fetches data, and renders the table.

### Key Parts of the Code

- **Fetching Data**:
  ```javascript
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://openlibrary.org/subjects/science_fiction.json?limit=100');
      const booksData = response.data.works.map(book => ({
        id: book.key,
        title: book.title,
        first_publish_year: book.first_publish_year,
        subject: book.subject ? book.subject.join(', ') : '',
        ratings_average: book.ratings_average || 'N/A',
        author_name: book.authors ? book.authors[0].name : 'Unknown',
        author_birth_date: 'N/A',
        author_top_work: book.title
      }));
      setBooks(booksData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books data", error);
      setLoading(false);
    }
  };
