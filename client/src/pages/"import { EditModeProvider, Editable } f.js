"import { EditModeProvider, Editable } from './editableComponents.js';
/* eslint-disable react/jsx-pascal-case */
import { useState } from 'react';
import './App.css';
function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const addTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, {
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    }
  };
  const toggleComplete = index => {
    const updatedTodos = [...todos];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    setTodos(updatedTodos);
  };
  const removeTodo = index => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
  };
  return <Editable.div className="container mx-auto p-4" id="ff1408cc-36ff-48f1-9edf-26199dd85eeb">
      <Editable.h1 className="text-3xl font-bold mb-4" id="fda9fbc4-d73a-48db-8aef-d889e93e2ef0">To-Do List</Editable.h1>
      <Editable.div className="mb-4" id="65f415c8-4f00-4d0a-b422-0937c8ff45bb">
        <Editable.input type="text" value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="Add a new to-do" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" id="91952647-5bc2-48bc-ac48-1b455d3aee43" />
        <Editable.button onClick={addTodo} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2" id="8545433f-4f9a-4859-9adb-7f87e7bbe28d">
          Add
        </Editable.button>
      </Editable.div>
      <Editable.ul id="eec4d767-e25d-4304-bd0f-e0639a3c0565">
        {todos.map((todo, index) => <Editable.li key={index} className="flex items-center mb-2" id="88e38d72-9992-418b-a9cb-4ae751511205">
            <Editable.input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(index)} className="mr-2" id="10e3e263-afea-4d5c-8c39-84fd349cadfa" />
            <Editable.span className={todo.completed ? 'line-through text-gray-500' : ''} id="14173f1a-7955-4930-bd2d-a1347a069b29">
              {todo.text}
            </Editable.span>
            <Editable.button onClick={() => removeTodo(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2" id="994925e1-2751-4215-808c-94aafab01086">
              X
            </Editable.button>
          </Editable.li>)}
      </Editable.ul>
      <Editable.img src="https://images.unsplash.com/photo-1516973377280-a5e5d0497b3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dG9kb3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60" alt="Todo Image" className="mt-8 w-full" id="50581e0c-9058-4fb2-8bc7-13452fa659f9" />
    </Editable.div>;
}
export default App;"