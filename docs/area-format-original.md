I'll convert this webpage about the Anyland Area export format into markdown, focusing on the meaningful content and removing the web infrastructure/analytics code.

# Anyland Area export format

When exporting an Area you created in Anyland (via the backside Export button of the Area context dialog), it will save an OBJ (Object), MAT (Material) and JSON file. The Json uses the following format:

```json
{
    "placements": [ // Array of all the area's Thing placements
        {
            "i": "12348e3a2da36d2d18b81234",       // Thing id
            "p": [-1.164725, 0.3008641, 10.53702], // Position x-y-z
            "r": [0, 0.95, 25.1],                  // Rotation x-y-z

            // All of following are omitted if at the default value:
            "s": [1, 1.25, 1], // The scale x-y-z
            "locked": true, // When locked
            "invisibleToEditors": true, // When invisible (to editors)
            "distanceToShow": 2.5, // When using a special "show at" distance

            "suppressScriptsAndStates": true, // When suppressing scripts and states
            "suppressCollisions": true, // When suppressing collisions
            "suppressLights": true, // When suppressing lights
            "suppressParticles": true, // When suppressing particles
            "suppressHoldable": true, // When suppressing holdable settings
            "suppressShowAtDistance": true, // When suppressing Show at Distance
        },
        {
            "i": "...",
            "p": [...],
            "r": [...]
        },
        ...
    ],

    "settings": {
        "filters": { // Filters, if any are set outside the default values
            "sa": -34, // Saturation, if any
            "bl": ..., // Bloom
            "sa": ..., // Saturation
            "co": ..., // Contrast
            "br": ..., // Brightness
            "cr": ..., // Color Reduction
            "hs": ..., // Hue Shift
            "dt": ..., // Distance Tint
            "iv": ..., // Inversion
            "hm": ...  // Heat Map
        },

        "sunDirection": [49.34043, 297.2435, 40.52029], // Rotation x-y-z of the environment sun light
        "sunOmitsShadow": true,  // If the sun is set to omit shadows
        "hasFloatingDust": true  // If there's floating dust in the area
    }
}
```