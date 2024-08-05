figma.loadAllPagesAsync();

figma.showUI(__html__);

figma.ui.resize(500, 500);

// Use this for group names
let count = 0;

// Find 'Colours : Primitives' collection in variables section
const collectionPromise = figma.variables.getLocalVariableCollectionsAsync();
collectionPromise.then(

  function(value) {
    let collection = value[0];

    // Set Light Mode Style - Required to set up variables
    collection.renameMode(collection.modes[0].modeId, "Value");
    const lightModeId = collection.modes[0].modeId;

    // Get Variables from UI
    figma.ui.onmessage = pluginMessage => {

      let colours = pluginMessage.colours;
      let colourPromise = figma.variables.getLocalVariablesAsync();

      colourPromise.then(

        function(value) {

          console.log(value);

          for(let i = 0; i < colours.length; i++) {
            
            let currentColour = colours[i];
            let colourExists = false;

            // This Colours Name
            let newColourName = colours[i].name;

            // Loop Through Existing Colours in Figma and see if this name exists
            for( let j = 0; j < value.length; j++ ) {

              if( value[j].name.startsWith(newColourName) ) {
                colourExists = true;
              }

            }

            if( colourExists ) {
              
              // Set Colour Name
              let colourName = currentColour.name;

              console.log(`${colourName} already exists!`);

              // Increment Count
              count++;
      
              // Convert back to RGB for Figma
              let RGBColourScale = [];
                
              for( let j = 0; j < currentColour.scale.length; j++ ) {
                let RGBColour = figma.util.rgb(currentColour.scale[j]);
                RGBColourScale.push(RGBColour);
              }

              // Loop Through Figmas Variable and find matching names
              let filtered = value.filter(col => col.name.startsWith(colourName));
      
              // Set Variables Up
              for(let j = 0; j < RGBColourScale.length; j++) {

                let colourVariable = figma.variables.getVariableByIdAsync(filtered[j].id);
                
                colourVariable.then(

                  function(value) {
                    console.log(value);
                    
                    // Update with New Values
                    if(value) {
                      value.setValueForMode(lightModeId, RGBColourScale[j]);
                    }
                  },

                  function(error) {
                    console.log(error);
                  }  
                );
              }

            } else {

              // Set Colour Name
              let colourName = colours[i].name;
      
              // Increment Count
              count++;
      
              // Convert back to RGB for Figma
              let RGBColourScale = [];
                
              for( let j = 0; j < currentColour.scale.length; j++ ) {
                let RGBColour = figma.util.rgb(currentColour.scale[j]);
                RGBColourScale.push(RGBColour);
              }
      
              // Set Variables Up
              for(let j = 0; j < RGBColourScale.length; j++) {
                let colourVariable = figma.variables.createVariable(`${colourName}/${colourName}-${j + 1}00`, collection, 'COLOR');
                colourVariable.setValueForMode(lightModeId, RGBColourScale[j]);
              }
            }
          }

        },

        function(error) {
          console.log(error);
        }
      );
    }
  },

  function(error) {
    console.log("Could not find 'Colours : Primitives' collection. Please make sure this has been created!");
  }
);