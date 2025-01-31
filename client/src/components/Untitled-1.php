
/* eslint-disable react/jsx-pascal-case */
import './App.css';

function App() {
  return (
      <div id="20a9f5a2-d1f0-4081-9aa6-aacf65d51c7f" className="App">
        {/* Navbar */}
        <nav id="dfabd52b-4f14-4e61-9e09-ae91557bbd18" className="Navbar">
          <ul id="cff1b5e1-b8e1-4c8a-9887-17149a403219">
            <li id="d0e0cb90-887d-4a1e-876b-be2f785eeb81"><a id="ec30a6b1-11e7-4101-a227-6e73c2a2f78d" href="#home">Home</a></li>
            <li id="9e010275-479a-444c-9e8d-cffdc3f4b367"><a id="2a09ef1c-b5d6-4438-a1eb-4df48fbca6ad" href="#about">About</a></li>
            <li id="c3aeafa6-0f55-4bed-b85f-11d64be41b7b"><a id="22c7c6ab-f988-46f3-93f3-57e42846af6c" href="#contact">Contact</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <main id="cde20925-a0d4-4036-9bd6-6d665eb17ba0" className="Main-content">
          <h1 id="6c4271aa-9beb-40ac-9b87-0d6103e75643">Welcome to My React Page</h1>
          <p id="890069d1-a563-49dd-bda0-0b34e1002f69">This is a simple React.js page with a navbar, a text box, and a styled div.</p>

          {/* Text Box */}
          <input id="95c96d4d-df7e-47a3-886f-37a4ccdae0d2"
            className="TextBox"
            type="text"
            placeholder="Enter something..."
          />

          {/* Styled Div */}
          <div id="3e41afe6-0a58-42ab-90eb-ad98c29927f6" className="Styled-div">
            <p id="b90996f2-21ea-4e90-bbac-a3b15c9ff978">This is a div with a background color and some text inside it!</p>
          </div>
        </main>
      </div>

  );
}

export default App;