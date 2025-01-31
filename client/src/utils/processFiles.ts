import * as recast from "recast";
import { FileItem } from "../types/index.ts";

/**
 * Processes files and updates JSX styles based on JSON styles.
 * @param {FileItem[]} files - List of files
 * @param {Record<string, { styles?: Record<string, string>; content?: string }>} styleChanges - JSON containing styles
 * @returns {FileItem[]} Updated files list
 */

/**
 * Converts a JSON string with style keys in camelCase to kebab-case.
 * @param {string} jsonString - The JSON string containing style data
 * @returns {string} A new JSON string with kebab-case style keys
 */
function convertStyleJSONToKebabCase(jsonString: string): string {
  try {
    const jsonData: Record<string, any> = JSON.parse(jsonString); // Parse string to object
    const newJson: Record<string, any> = {};

    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        const item = jsonData[key];

        // If the item has a "styles" field, convert its keys to kebab-case
        if (item.styles) {
          newJson[key] = {
            ...item,
            styles: Object.fromEntries(
              Object.entries(item.styles).map(([styleKey, value]) => [
                styleKey.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), // Convert to kebab-case
                value
              ])
            )
          };
        } else {
          newJson[key] = item; // Copy other fields as-is
        }
      }
    }

    return JSON.stringify(newJson, null, 2); // Convert back to string with formatting
  } catch (error) {
    console.error("❌ Error parsing JSON:", error);
    return jsonString; // Return original string if parsing fails
  }
}


function convertStyleKeysToKebabCase(styleData: Record<string, string>): Record<string, string> {
  if (!styleData || typeof styleData !== "object") {
    console.error("❌ Invalid styleData provided:", styleData);
    return {};
  }

  const kebabCaseStyles = Object.fromEntries(
    Object.entries(styleData).map(([key, value]) => {
      const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(); // Convert to kebab-case
      console.log(`🎨 Converting style key: "${key}" → "${kebabKey}" with value: "${value}"`);
      return [kebabKey, value];
    })
  );

  console.log("✅ Converted styleData:", kebabCaseStyles);
  return kebabCaseStyles;
}



export const processFilesWithStyles = (
  files: FileItem[],
  styleChanges: Record<string, { id: string; styles?: Record<string, string>; content?: string }>
): FileItem[] => {
  console.log("Style Changes:", styleChanges);
  


  return files.map((file) => {
    if (file.type === "folder" && file.children) {
      // Recursively process the folder's children
      console.log(`📂 Entering folder: ${file.path}`);
      return {
        ...file,
        children: processFilesWithStyles(file.children, styleChanges),
      };
    } else {
      try {
        console.log(`🔍 Processing file: ${file.name}...`);
        const updatedCode = updateReactCode(file.content, styleChanges);
        console.log(`✅ File processed successfully: ${file.name}\n`);
        return { ...file, content: updatedCode }; // Return updated file
      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
        return file; // Return original file if processing fails
      }
    }
  });
};


/**
 * Updates React JSX code based on styleChanges JSON.
 * @param {string} codeString - JSX code as string
 * @param {string} jsonString - JSON containing styles (as string)
 * @returns {string} Updated JSX code
 */
function updateReactCode(codeString: string, jsonString: string): string {
  if (!codeString || typeof codeString !== "string") {
    console.error("❌ Invalid code input for parsing.");
    return codeString;
  }
  console.log("jsonString is:", jsonString);
  // const styleChangesKebabCase = convertStyleJSONToKebabCase(jsonString);
  // console.log("jsonString is:111:", styleChangesKebabCase);
  // console.log("jsonString2 is:", JSON.stringify(jsonString));

  let jsonData;
  try {
    jsonData = JSON.parse(jsonString);
    // jsonData = JSON.parse(jsonData);
    // jsonData = JSON.parse(jsonData);

  } catch (error) {
    console.error("❌ Error parsing JSON data:", error);
    return codeString;
  }
  console.log("filedata is:", codeString);
  console.log("json is:", jsonData);

  let ast;
  try {
    ast = recast.parse(codeString); // ✅ Parse React code string into AST
  } catch (error) {
    console.error("❌ Error parsing JSX code:", error);
    return codeString;
  }

  recast.types.visit(ast, {
    visitJSXElement(path) {
      const openingElement = path.node.openingElement;

      // Extract the full element name, including namespaces (e.g., Editable.div)
      const elementName =
        openingElement.name.type === "JSXMemberExpression"
          ? `${openingElement.name.object.name}.${openingElement.name.property.name}`
          : openingElement.name.name;

      // Find the `id` attribute
      const idAttr = openingElement.attributes?.find(
        (attr) => attr.name?.name === "id"
      );

      if (idAttr?.value?.value && jsonData[idAttr.value.value]) {
        console.log(`🎯 Found element: <${elementName} id="${idAttr.value.value}">`);
        const styleData = convertStyleKeysToKebabCase(jsonData[idAttr.value.value].styles);

        const contentData = jsonData[idAttr.value.value].content;



        // ✅ Update styles if provided
        if (styleData && Object.keys(styleData).length > 0) {
          let styleAttr = openingElement.attributes.find(
            (attr) => attr.name && attr.name.name === "style"
          );

          console.log(`🎨 Updating styles for ID ${idAttr.value.value}:`, styleData);

          if (styleAttr) {

            styleAttr.value = recast.types.builders.jsxExpressionContainer(
              recast.types.builders.objectExpression(
                Object.entries(styleData).map(([key, value]) =>
                  recast.types.builders.property(
                    "init",
                    recast.types.builders.stringLiteral(key), // Now kebab-case!
                    recast.types.builders.literal(value)
                  )
                )
              )
            );
            

          } else {
            // Add new `style` attribute
            openingElement.attributes.push(
              recast.types.builders.jsxAttribute(
                recast.types.builders.jsxIdentifier("style"),
                recast.types.builders.jsxExpressionContainer(
                  recast.types.builders.objectExpression(
                    Object.entries(styleData).map(([key, value]) =>
                      recast.types.builders.property(
                        "init",
                        recast.types.builders.stringLiteral(key),
                        recast.types.builders.literal(value)
                      )
                    )
                  )
                )
              )
            );
          }
        }

        // ✅ Update content if provided
        if (contentData && typeof contentData === "string") {
          console.log(`📝 Updating content for ID ${idAttr.value.value}: "${contentData}"`);
          path.node.children = [recast.types.builders.jsxText(contentData)];
        }
      }

      this.traverse(path);
    },
  });

  return recast.print(ast).code;
}





/** 🔥 Example Input Data for Debugging */

// ✅ Example Input JSX Code
const inputCodeExample = `
import { EditModeProvider } from './components.js';\n\n/* eslint-disable react/jsx-pascal-case */\nimport './App.css';\n\nfunction App() {\n  return (\n    <EditModeProvider>\n      <div id=\"20a9f5a2-d1f0-4081-9aa6-aacf65d51c7f\" className=\"App\">\n        {/* Navbar */}\n        <nav id=\"dfabd52b-4f14-4e61-9e09-ae91557bbd18\" className=\"Navbar\">\n          <ul id=\"cff1b5e1-b8e1-4c8a-9887-17149a403219\">\n            <li id=\"d0e0cb90-887d-4a1e-876b-be2f785eeb81\"><a id=\"ec30a6b1-11e7-4101-a227-6e73c2a2f78d\" href=\"#home\">Home</a></li>\n            <li id=\"9e010275-479a-444c-9e8d-cffdc3f4b367\"><a id=\"2a09ef1c-b5d6-4438-a1eb-4df48fbca6ad\" href=\"#about\">About</a></li>\n            <li id=\"c3aeafa6-0f55-4bed-b85f-11d64be41b7b\"><a id=\"22c7c6ab-f988-46f3-93f3-57e42846af6c\" href=\"#contact\">Contact</a></li>\n          </ul>\n        </nav>\n\n        {/* Main Content */}\n        <main id=\"cde20925-a0d4-4036-9bd6-6d665eb17ba0\" className=\"Main-content\">\n          <h1 id=\"6c4271aa-9beb-40ac-9b87-0d6103e75643\">Welcome to My React Page</h1>\n          <p id=\"890069d1-a563-49dd-bda0-0b34e1002f69\">This is a simple React.js page with a navbar, a text box, and a styled div.</p>\n\n          {/* Text Box */}\n          <input id=\"95c96d4d-df7e-47a3-886f-37a4ccdae0d2\"\n            className=\"TextBox\"\n            type=\"text\"\n            placeholder=\"Enter something...\"\n          />\n\n          {/* Styled Div */}\n          <div id=\"3e41afe6-0a58-42ab-90eb-ad98c29927f6\" className=\"Styled-div\">\n            <p id=\"b90996f2-21ea-4e90-bbac-a3b15c9ff978\">This is a div with a background color and some text inside it!</p>\n          </div>\n        </main>\n      </div>\n    </EditModeProvider>\n  );\n}\n\nexport default App;
`;

// ✅ Example Style Changes JSON
const jsonDataExample: Record<string, { id: string; styles?: Record<string, string>; content?: string }> = {
  "ec30a6b1-11e7-4101-a227-6e73c2a2f78d": {
    "id": "ec30a6b1-11e7-4101-a227-6e73c2a2f78d",
    "styles": {},
    "content": "Home"
  },
  "d0e0cb90-887d-4a1e-876b-be2f785eeb81": {
    "id": "d0e0cb90-887d-4a1e-876b-be2f785eeb81",
    "styles": {},
    "content": "Home"
  },
  "2a09ef1c-b5d6-4438-a1eb-4df48fbca6ad": {
    "id": "2a09ef1c-b5d6-4438-a1eb-4df48fbca6ad",
    "styles": {},
    "content": "About"
  },
  "9e010275-479a-444c-9e8d-cffdc3f4b367": {
    "id": "9e010275-479a-444c-9e8d-cffdc3f4b367",
    "styles": {},
    "content": "About"
  },
  "22c7c6ab-f988-46f3-93f3-57e42846af6c": {
    "id": "22c7c6ab-f988-46f3-93f3-57e42846af6c",
    "styles": {},
    "content": "Contact"
  },
  "c3aeafa6-0f55-4bed-b85f-11d64be41b7b": {
    "id": "c3aeafa6-0f55-4bed-b85f-11d64be41b7b",
    "styles": {},
    "content": "Contact"
  },
  "cff1b5e1-b8e1-4c8a-9887-17149a403219": {
    "id": "cff1b5e1-b8e1-4c8a-9887-17149a403219",
    "styles": {},
    "content": "Home About Contact"
  },
  "dfabd52b-4f14-4e61-9e09-ae91557bbd18": {
    "id": "dfabd52b-4f14-4e61-9e09-ae91557bbd18",
    "styles": {},
    "content": "Home About Contact"
  },
  "6c4271aa-9beb-40ac-9b87-0d6103e75643": {
    "id": "6c4271aa-9beb-40ac-9b87-0d6103e75643",
    "styles": {},
    "content": "Welcome to My React Page"
  },
  "890069d1-a563-49dd-bda0-0b34e1002f69": {
    "id": "890069d1-a563-49dd-bda0-0b34e1002f69",
    "styles": {},
    "content": "This is a simple React.js page with a navbar, a text box, and a styled div."
  },
  "95c96d4d-df7e-47a3-886f-37a4ccdae0d2": {
    "id": "95c96d4d-df7e-47a3-886f-37a4ccdae0d2",
    "styles": {}
  },
  "b90996f2-21ea-4e90-bbac-a3b15c9ff978": {
    "id": "b90996f2-21ea-4e90-bbac-a3b15c9ff978",
    "styles": {
      "fontSize": "20px",
      "color": "#007bff"
    },
    "content": "This is a div with a background color and some text inside it!"
  },
  "3e41afe6-0a58-42ab-90eb-ad98c29927f6": {
    "id": "3e41afe6-0a58-42ab-90eb-ad98c29927f6",
    "styles": {}
  },
  "cde20925-a0d4-4036-9bd6-6d665eb17ba0": {
    "id": "cde20925-a0d4-4036-9bd6-6d665eb17ba0",
    "styles": {}
  },
  "20a9f5a2-d1f0-4081-9aa6-aacf65d51c7f": {
    "id": "20a9f5a2-d1f0-4081-9aa6-aacf65d51c7f",
    "styles": {}
  }
}
  ;

// ✅ Debugging: Update JSX with styles from JSON
const updatedCodeExample = updateReactCode(inputCodeExample, JSON.stringify(jsonDataExample));

console.log("🔥 Updated Code:\n", updatedCodeExample);