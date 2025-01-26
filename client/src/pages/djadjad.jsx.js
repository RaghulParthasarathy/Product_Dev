/* eslint-disable react/jsx-pascal-case */
import { EditModeProvider, Editable } from './editableComponents.js';

function App() {
    return (
        <EditModeProvider>
            <Editable.div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Editable.p>Start prompting (or editing) to see magic happen :)</Editable.p>
            </Editable.div>
        </EditModeProvider>
    );
}