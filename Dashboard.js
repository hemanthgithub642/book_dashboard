import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useTable, useSortBy, usePagination } from 'react-table';
import { saveAs } from 'file-saver';
import './Dashboard.css';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  const data = useMemo(() => {
    let filteredData = books;
    if (searchTerm) {
      filteredData = filteredData.filter(book =>
        book.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredData;
  }, [books, searchTerm]);

  const columns = useMemo(() => [
    { Header: 'Title', accessor: 'title' },
    { Header: 'First Publish Year', accessor: 'first_publish_year' },
    { Header: 'Subject', accessor: 'subject' },
    { Header: 'Ratings Average', accessor: 'ratings_average' },
    { Header: 'Author Name', accessor: 'author_name' },
    { Header: 'Author Birth Date', accessor: 'author_birth_date' },
    { Header: 'Author Top Work', accessor: 'author_top_work' },
    {
      Header: 'Actions',
      Cell: ({ row }) => (
        editRowId === row.original.id ? (
          <>
            <button onClick={() => handleSave(row.original.id)}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button onClick={() => handleEdit(row.original)}>Edit</button>
        )
      ),
    },
  ], [editRowId, editFormData]);

  function handleEdit(row) {
    setEditRowId(row.id);
    setEditFormData(row);
  }

  const handleCancel = () => {
    setEditRowId(null);
    setEditFormData({});
  };

  const handleSave = (id) => {
    const updatedBooks = books.map(book =>
      book.id === id ? editFormData : book
    );
    setBooks(updatedBooks);
    setEditRowId(null);
    setEditFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };
  
  const handleDownloadCSV = () => {
    const csvData = books.map(book => ({
      Title: book.title,
      'First Publish Year': book.first_publish_year,
      Subject: book.subject,
      'Ratings Average': book.ratings_average,
      'Author Name': book.author_name,
      'Author Birth Date': book.author_birth_date,
      'Author Top Work': book.author_top_work,
    }));
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(item => Object.values(item).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'books_data.csv');
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize: updatePageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div>
      <header className="App-header">
        <h1>Open Library Dashboard</h1>
      </header>
      <div className="search">
        <input
          type="text"
          placeholder="Search by author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>
                        {editRowId === row.original.id ? (
                          <input
                            type="text"
                            name={cell.column.id}
                            value={editFormData[cell.column.id]}
                            onChange={handleChange}
                          />
                        ) : (
                          cell.render('Cell')
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
              {'<<'}
            </button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>
              {'<'}
            </button>
            <button onClick={() => nextPage()} disabled={!canNextPage}>
              {'>'}
            </button>
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
              {'>>'}
            </button>
            <span>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{' '}
            </span>
            <span>
              | Go to page:{' '}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                style={{ width: '100px' }}
              />
            </span>
            <select
              value={pageSize}
              onChange={e => updatePageSize(Number(e.target.value))}
            >
              {[10, 20, 30, 40, 50, 100].map(size => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleDownloadCSV}>Download CSV</button>
        </>
      )}
    </div>
  );
};


export default Dashboard;

