import { useState } from 'react';
import { Plus } from 'lucide-react';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, { text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const toggleComplete = (index) => {
    const updatedTodos = [...todos];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    setTodos(updatedTodos);
  };

  const removeTodo = (index) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">To-Do List</h1>
      <div className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-1 border border-gray-300 rounded px-3 py-2 mr-2"
        />
        <button onClick={addTodo} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <Plus className="inline mr-2" />Add
        </button>
      </div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index} className="flex justify-between items-center border-b border-gray-200 py-2">
            <div className={`flex items-center ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(index)}
                className="mr-2"
              />
              {todo.text}
            </div>
            <button onClick={() => removeTodo(index)} className="text-red-500 hover:text-red-700">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <img src="https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHRvZG98ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60" alt="Todo app background" className="mt-8 w-full h-64 object-cover"/>
    </div>
  );
}

export default App;