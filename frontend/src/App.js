import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // Set the default active link
  const [activeLink, setActiveLink] = useState('home');

  // Function to handle click on a nav link
  const handleNavClick = (link) => {
    setActiveLink(link);
  };

  return (
    <div className="App">
      {/* Navbar */}
      <nav id="main-nav">
        <div className="navbar-title">AutoLocate</div>
        <div className="navbar-links">
          <a
            href="#home"
            className={`nav-links ${activeLink === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Home
          </a>
          <a
            href="#search"
            className={`nav-links ${activeLink === 'search' ? 'active' : ''}`}
            onClick={() => handleNavClick('search')}
          >
            Search
          </a>
          <a
            href="#book"
            className={`nav-links ${activeLink === 'book' ? 'active' : ''}`}
            onClick={() => handleNavClick('book')}
          >
            Book
          </a>
          <a
            href="#rating"
            className={`nav-links ${activeLink === 'rating' ? 'active' : ''}`}
            onClick={() => handleNavClick('rating')}
          >
            Rating
          </a>
        </div>
      </nav>

      {/* Home Section */}
      <div id="home">
        <h2>CAR REPAIR AND MAINTENANCE SERVICE</h2>
      </div>

      {/* Search Section */}
      <div id="search">
        <h2>Search Section</h2>

        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <input type="text" id="myInput" placeholder="Seach for AutoShop..."></input>
            </div>
          </div>
        </div>

        {/* Mechanic Shop Cards */}
        <div className='shop-container mt-4'>


          <div className='shop-card col-md-4'>
            <h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span> </h3>
          </div>
          <div className='shop-card col-md-4'>
            <h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span> </h3>
          </div>
          <div className='shop-card col-md-4'>
            <h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span> </h3>
          </div>
          <div className='shop-card col-md-4'>
            <h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span> </h3>
          </div>
          <div className='shop-card col-md-4'>
            <h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span> </h3>
          </div>
          <div className='shop-card col-md-4'>
            <h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span> </h3>
          </div>
          <div className='shop-card col-md-4'>
            <h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span> </h3>
          </div>
          <div className='shop-card col-md-4'>
            <h3>Batnes Auto Mechanic <span className='stars'>★★★★★</span> </h3>
          </div>


        </div>
      </div>


      <div id="book">
        <h2>Book Section</h2>
        <p></p>
      </div>
      <div id="rating">
        <h2>Rating Section</h2>
        <p></p>
      </div>
    </div>
  );
}

export default App;
