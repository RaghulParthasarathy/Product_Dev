import { EditModeProvider, Editable } from './editableComponents.js';
import React from 'react';

function App() {

    return (
        <EditModeProvider>
            <Editable.div id="1" className="App">
                <Editable.h1 id="f0c257f5-116c-493d-a45b-8d7a70091d40">Hello, World!</Editable.h1>
            </Editable.div>
        </EditModeProvider>

    );
}