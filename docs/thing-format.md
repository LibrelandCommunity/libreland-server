# Thing Format

Things in Anyland are stored in JSON format and contain all the information needed to render and interact with objects in the virtual world. This document describes the structure of thing definition files stored in `/data/thing/def/{thingId}.json`.

## Basic Structure

```json
{
    "n": "thing name",
    "a": [1, 2, 5],
    "d": "description",
    "inc": [["name1", "id123"], ["name2", "id456"]],
    "v": [7],
    "tp_m": 1.0,
    "tp_d": 0.5,
    "tp_ad": 0.5,
    "tp_lp": false,
    "tp_lr": false,
    "p": []
}
```

## Core Properties

- **n** - Thing name
- **a** - Thing attributes (array of numbers)
- **d** - Description (optional, up to 200 characters)
- **inc** - Included name-ids for emits and other references
- **v** - Thing version (array)

## Physics Properties

- **tp_m** - Thing physics mass
- **tp_d** - Thing physics drag
- **tp_ad** - Thing physics angular drag
- **tp_lp** - Thing physics lock position
- **tp_lr** - Thing physics lock rotation

## Parts Array

The `p` array contains the individual parts that make up the thing. Each part can have the following properties:

```json
{
    "b": 1,
    "t": 2,
    "a": [1, 2, 5],
    "n": "part name",
    "id": "unique_id",
    "e": "text content",
    "lh": 1.0,
    "s": []
}
```

### Part Properties

- **b** - Base shape type
- **t** - Material type
- **a** - Part attributes
- **n** - Part name (optional, up to 100 characters)
- **id** - Unique part identifier (optional)
- **e** - Text content
- **lh** - Text line height

### States Array

Each part can have multiple states defined in the `s` array:

```json
{
    "p": [0.022, 0.012, 0.032],
    "r": [0.021, 0.031, 0.031],
    "s": [0.022, 0.021, 0.033],
    "c": [0.95, 0.21, 0.01],
    "b": [
        "when touched then play bing",
        "when told foo then emit basketball, play munch"
    ]
}
```

- **p** - Position [x, y, z]
- **r** - Rotation [x, y, z]
- **s** - Scale [x, y, z]
- **c** - Color [r, g, b]
- **b** - Behavior script lines

## Thing Versions

Version information is stored in the `v` array. Different versions have different functionality:

1. Version 1: Original version with "send nearby" behavior
2. Version 2: Image material handling
3. Version 3: Font material glow behavior
4. Version 4: Bouncy & slidy behavior
5. Version 5: Web tell commands
6. Version 6: Rotation unit changes
7. Version 7: Tell command behavior
8. Version 8: Sound loop behavior
9. Version 9: Current version

## Additional Features

### Included Sub-things
```json
"i": [
    {
        "t": "thing_id",
        "p": [0, 0, 0],
        "r": [0, 0, 0],
        "n": "override_name",
        "a": [1, 2]
    }
]
```

### Placed Sub-things
```json
"su": [
    {
        "i": "placement_id",
        "t": "thing_id",
        "p": [0, 0, 0],
        "r": [0, 0, 0]
    }
]
```

### Auto-continuation
```json
"ac": {
    "id": "part_id",
    "c": 5,
    "w": 2,
    "rp": 0.1,
    "rr": 0.1,
    "rs": 0.1
}
```

### Changed Vertices
```json
"c": [
    [1.052, -0.003, 0.025, 1001, 4]
]
```

### Body Parts
```json
"bod": {
    "h": {"p": [0, 0, 0], "r": [0, 0, 0]},
    "ut": {"i": "123", "p": [0, 0, 0], "r": [0, 0, 0]},
    "lt": {},
    "ll": {},
    "lr": {},
    "ht": {},
    "al": {},
    "ar": {}
}
```