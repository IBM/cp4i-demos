# The `classifyImages` flow
## Summary
This API takes an image and a serviceNow ticket number as input.

It responds with what the image was recognised as, and its maximum claimable value.
It also augments the ticket;
- Adds the image as an attachment to the ticket
- Augments the `description` field with a JSON structure that holds the information discovered (for later retrieval)

{{$IBMWatsonVisualRecognitionClassifyimages2.classify_images.classifiers.classes}}

## Flow details
1. Retrieves the ServiceNow ticket
2. Checks that either an image (file base64 encoded) or a URL to an image has been supplied
 * Basic logic
   - If an image has been supplied, it adds it as an attachment to ServiceNow
    - If a URL has been supplied, it does not add an attachment and adds the attachment ID as the IF output context
    - If neither supplied, exits the flow with error
3. Invokes Watson Visual Recognition to get the recognised 'classes' for the image from the 'default classifier'
4. Uses the JSON parse node to set an arbitrary set of 'claimable values' for a few classes
5. The `set variable node` augments the discovered classes with their claimable value

## Explanation of the JSONata used in `classifyImagesv4`
This jsonata is used in classifyImagesV4 in the 'Set variable' node
```
$filter(
  $map(
    $eval($If.classes),
    function($o){
      {
        "class": $o.class,
        "score": $o.score,
        "value": $lookup($JSONParserParse , $o.class)
      }
    }
  ),
  function($v){
    "value" in $keys($v)
  }
)
```

It's purpose is to look up a value from the definitions created in the JSON parse node;
``` json
{
  "refrigeration system": 1000,
  "refrigerator": 1000,
  "deep-freeze": 1000,
  "photographic equipment": 1500,
  "appliance": 300,
  "coupe car": 20000,
  "vehicle": 10000}
```
The `$map` part of the expression to 'merges' this information with the `classes` returned from Watson Visual Recognition. There is a detailed explanation of how the map part of JSONata works [here](https://github.ibm.com/PHIPPEN/jsonata-by-example#use-an-object-for-key-value-lookup).

The `$filter` expression removes any classes that do not have a `value` defined.


In the 'Set variable node';
```
$filter(                      /* filter the augmented array for elements that have a "value" */
  $map(                       /* augments the 'classes' array with values */
    $IBMWatsonVisualRecognitionClassifyimages.classify_images.classifiers.classes,            
    function($o){                  /* look up the value */
      {
        "class": $o.class,
        "score": $o.score,
        "value": $lookup($JSONParserParse , $o.class)  
      }
    }
  ),
  function($v){                    /* checks if this element has a "value" field */
    "value" in $keys($v)
  }
)
```
To play with this example, [check here](https://try.jsonata.org/2YjqpJZ2z)

### An alternative JSONata
What I [could have done](https://try.jsonata.org/btPADu23a), which uses the ['dot operator'](https://docs.jsonata.org/path-operators#-map) instead of an explicit `$map()`
```
$filter(     /* filter the augmented array for elements that have a "value" */
  $IBMWatsonVisualRecognitionClassifyimages.classify_images.classifiers.classes.{
      "class": class,
      "score": score,
      "value": $lookup($JSONParserParse , class)
  },
  function($v){  /* checks if this element has a "value" field */
    $v."value"                      /* the 'truthiness' of this is false if there is no "value" field */
  }
)
```
