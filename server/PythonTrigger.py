import nbformat
import sys
import pickle
from nbclient import NotebookClient

# Read cell index from JavaScript argument
if len(sys.argv) < 2:
    print(" Error: Cell index not provided!")
    sys.exit(1)

cell_index = int(sys.argv[1])  # Convert argument to integer

# Load the notebook
nb_path = "MLModelComplete.ipynb"
nb = nbformat.read(nb_path, as_version=4)
client = NotebookClient(nb)

# ✅ Load saved variables
try:
    with open("variables.pkl", "rb") as f:
        global_vars = pickle.load(f)
        globals().update(global_vars)  # Restore saved variables
    # print(f"Loaded saved variables before executing Cell {cell_index}")
except FileNotFoundError:
    print("No saved variables found! You must run previous cells once.")

# ✅ Execute only the requested cell
if cell_index >= len(nb["cells"]):
    print(f"Error: Cell index {cell_index} is out of range!")
    sys.exit(1)

# print(f"Now Executing Cell {cell_index}...")
exec(nb["cells"][cell_index]["source"])
