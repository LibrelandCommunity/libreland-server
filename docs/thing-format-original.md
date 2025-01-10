# Anyland Thing Structure

When exporting a Thing you created in Anyland (via the backside Export button of the Thing context dialog), it will save an OBJ (Object), MAT (Material) and JSON file. The JSON uses the following format (subject to change). Please note spaces are only added for readability, and omitted in the actual JSON to ensure smallest possible file size.

```json
{
    "n": "wooden table", // thing name
    "a": [1, 2, 5], // thing attributes
    "d": "...", // an optional description of up to 200 characters
    "inc": [ ["some name", "id123"], ["some name", "id123"], ... ], // included name-ids for emits and more
    "v": [7], // thing version

    "tp_m": "...", // thing physics mass
    "tp_d": "...", // thing physics drag
    "tp_ad": "...", // thing physics angular drag
    "tp_lp": "...", // thing physics lock position
    "tp_lr": "...", // thing physics lock rotation

    "p": [ // parts
        {
            "b": 1, // base shape type
            "t": 2, // material type
            "a": [1, 2, 5], // thing part attributes
            "n": "...", // an optional part name of up to 100 characters,
                       // also useful for additional export/import info

            "id": "...", // optional unique part identifier

            "e": "abc", // text
            "lh": "...", // text line height

            "i": [ // included sub-things
                {
                    "t": "...", // thing id of sub-thing
                    "p": "...", // relative position
                    "r": "...", // relative rotation
                    "n": "...", // optional name override
                    "a": [...], // optional attributes to invert, e.g. uncollidable
                }
            ],

            "su": [ // placed sub-things, referring to area placements
                {
                    "i": "...", // placement id
                    "t": "...", // thing id
                    "p": "...", // position
                    "r": "..." // rotation
                }
            ],

            "im": "...", // image URL (from Steam and other whitelisted sources)
            "imt": "...", // image type (if PNG instead of default JPG)

            "pr": "...", // particle system type

            "t1": "...", // texture type layer 1
            "t2": "...", // texture type layer 2

            "ac": { // auto-continuation/auto-complete
                "id": "...", // thing part identifier reference
                "c": "...", // count
                "w": "...", // waves amount, if > 1
                "rp": "...", // position randomization factor
                "rr": "...", // rotation randomization factor
                "rs": "...", // scale randomization factor
            },

            "c": { // changed vertices
                // see format description below
            },

            "s": [ // states
                {
                    "p": [0.022, 0.012, 0.032], // position
                    "r": [0.021, 0.031, 0.031], // rotation
                    "s": [0.022, 0.021, 0.033], // scale
                    "c": [0.95, 0.21, 0.01], // color
                    "b": [ // behavior script lines
                        "when touched then play bing",
                        "when told foo then emit basketball, play munch"
                    ]
                }
            ],

            "bod": [ // auto-attached body parts of head, optional auto-positioning of head
                "h": {"p": [0.022, 0.012, 0.032], "r": [0.021, 0.031, 0.031]}, // head position, rotation
                "ut": {"i": "123", "p": [0.022, 0.012, 0.032], "r": [0.021, 0.031, 0.031]}, // upper torso id, position, rotation
                "lt": {...}, // lower torso
                "ll": {...}, // leg left (upper knee end of lower leg)
                "lr": {...}, // leg right (upper knee end of lower leg)
                "ht": {...}, // head top
                "al": {...}, // arm left
                "ar": {...}, // arm right
            ]
        }
    ]
}
```

## Example

Here's a simple two-parts example. You can import it into Anyland by copying it to the clipboard, then pressing Ctrl+V on the main dialog (where it says "Create Thing"). Note when importing & saving, whitespace and returns will be removed.

```json
{
    "n": "cyan purple x",
    "p":
    [
        {
            "b": 3,
            "s":
            [
                {
                    "p": [0.5, 0, 0],
                    "r": [45, 0, 0],
                    "s": [0.1, 0.8, 0.1],
                    "c": [0, 1, 1]
                }
            ]
        },

        {
            "b": 3,
            "s":
            [
                {
                    "p": [0.5, 0, 0],
                    "r": [-45, 0, 0],
                    "s": [0.1, 0.8, 0.1],
                    "c": [1, 0, 1]
                }
            ]
        }
    ]
}
```

## Thing Part Base Types

```csharp
public enum ThingPartBase {
    Cube = 1,
    Pyramid = 2,
    Sphere = 3,
    Cone = 4,
    Cylinder = 5,
    Triangle = 6,
    Trapeze = 7,
    Hedra = 8,
    Icosphere = 9,
    LowPolySphere = 10,
    // ... many more shapes ...
    Octahedron = 251
};
```

## Thing Attributes

```csharp
public enum ThingAttribute {
    isClonable = 1,
    isHoldable = 2,
    remainsHeld = 3,
    isClimbable = 4,
    isPassable = 6,
    isUnwalkable = 5,
    doSnapAngles = 7,
    isBouncy = 9,
    // ... many more attributes ...
    floatsOnLiquid = 52
};
```

## Thing Part Attributes

```csharp
public enum ThingPartAttribute {
    offersScreen = 1,
    scalesUniformly = 3,
    videoScreenHasSurroundSound = 4,
    isLiquid = 5,
    // ... many more attributes ...
    isDedicatedCollider = 38
};
```

## Material Types

```csharp
public enum MaterialTypes {
    None = 0,
    Metallic = 1,
    Glow = 2,
    PointLight = 3,
    SpotLight = 4,
    // ... many more types ...
    InvisibleWhenDone_Deprecated = 8
};
```

## Texture Types

```csharp
public enum TextureType {
    None = 0,
    Gradient = 2,
    Geometry_Gradient = 161,
    WoodGrain = 3,
    // ... many more types ...
    Outline = 168
};
```

## Thing Versions

Some older objects have different functionality which is still supported for backwards compatibility. As soon as an object is edited & re-saved, it will jump to the current latest thing version. A missing version field means version 1.

1. To emulate an old bug-used-as-feature-by-people behavior, for downwards-compatibility reasons, "send nearby" commands of things saved at this version are treated to mean "send one nearby" when part of emitted or thrown items stuck to someone.

2. If the thingPart includes an image, the material will be forced to become default and white (and black during loading). In version 3+ it will be left as is, and e.g. glowing becomes a glowing image, and thingPart colors are being respected.

3. The default font material in version 4+ is non-glowing. Version 3- fonts will take on the glow material.

4. In version 4-, bouncy & slidy for thrown/emitted things were both selectable, but mutually exclusive in effect (defaulting on bouncy). Since v5+ they mix.

5. In version 5-, "tell web" and "tell any web" didn't exist as special tell scope commands, so they will be understood as being tell/tell any with "web" as data.

6. In version 6-, one unit of the "set constant rotation" command equals 10 rotation degrees (instead of 1 in later version).

7. In version 8, the "tell in front" and "tell first in front" commands were added. In version 7-, "in front"/"first in front" are considered normal tell data text.

8. As of version 9, sounds played via the Loop command adhere to the Thing's Surround Sound attribute. In version 8-, that setting was ignored.

9. The current thing version.

## Image Type

```csharp
public enum ImageType {
    Jpeg = 0,
    Png = 1
}
```

## Particle System Type

```csharp
public enum ParticleSystemType {
    None = 0,
    Flares = 1,
    Twinkle = 2,
    Clouds = 3,
    // ... many more types ...
    Spheres = 60
};
```

## Changed Vertices

Changed vertices are saved in a structure like this:

```json
"c": [ [x, y, z, relative index 1, relative index 2, ...], ... ]
```

For example:

```json
"c": [ [1.052, -0.003, 0.025, 1001, 4, ...], ... ]
```

X, y and z are the vertices' new position. For any object <= 10m at its biggest axis, these coordinates are rounded to 3 digits for JSON file size optimization.

Following the coordinates are the indexes, but for file size optimization, they are only referring to their relative offset to the last index. So if 1001 is the first but 1005 is the second index, we shorten to "1001, 4" (i.e., 1005 - 1001 = 4).

Additional properties:

```json
"sa": ..., // smoothing angle
"cx": ..., // convex (true: 1, false: 0)
```

If the same changed-vertices (including the same smoothing angle and convex setting) are used across several parts in the thing, for size optimization we don't re-include the full data, but simply refer to the other part using its zero-based index within the thing parts array order:

```json
"v": 3
```