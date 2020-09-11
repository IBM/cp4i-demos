## JSONata expression
```
{{$filter($map($Setvariable2.variable.classes ,function($o){ {"class": $o.class,"score": $o.score,"value": $lookup($JSONParserParse , $o.class)}} ) , function($v){"value" in $keys($v)})}}


```
(

  /* Background
   * 'classValues' is an object that has one property for each
   * 'class' (from Watson Visual Recognition)
   *
   * The 'value' is used in the insurance demo as 'the insurable value'
   * of that class
   */

  /*------------- Define functions --------------------*/
  /*
   * filter expression to check for items that have a "value" property set
   * Returns true if there is such a property
   * Returns false if there is not
   */  
  $hasValue := function($v){"value" in $keys($v)};

  /* finds the value of a "class" from the classValues object */
  $valueOf := function($classObj) {$lookup(classValues, $classObj.class)};

  /*
   * augments a single element from the 'classes' array with its
   * insurable value
   */
  $augmentWithValue := function($cObj){
            {
                "class": $cObj.class,
                "score": $cObj.score,
                "value": $valueOf($cObj)
            }
  };

  /*
   * Augments the 'classes' array with insurable values
   * Where a class does NOT have an insured value
   * it is left unchanged
   */
  $arrayWithValues := $map(
          classification.classify_images.classifiers.classes,
          $augmentWithValue
       );

  /*-----------------------------------------------------------
   *
   * This is the JSONata expression that actually gets evaluated !
   * It removes any items that do not have a value filtering it
   * with the $hasValue function
   */
  $filter(
      $arrayWithValues,
      $hasValue
  )
)
```

## Sample data
``` json
{
  "classification": {
    "images_processed": 1,
    "custom_classes": 0,
    "classify_images": [
      {
        "classifiers": [
          {
            "classifier_id": "default",
            "name": "default",
            "classes": [
              {
                "class": "refrigeration system",
                "score": 0.954,
                "type_hierarchy": "/cooling system/refrigeration system"
              },
              {
                "class": "cooling system",
                "score": 0.954
              },
              {
                "class": "appliance",
                "score": 0.8
              },
              {
                "class": "ash grey color",
                "score": 0.904
              },
              {
                "class": "sage green color",
                "score": 0.803
              }
            ]
          }
        ],
        "image": "custom.jpg"
      }
    ]
  },
  "classValues":{
    "refrigeration system": 1000,
    "appliance": 100
  },
  "id": "Mattie Ward"
}
```
## Result
``` JSON
[
  {
    "class": "refrigeration system",
    "score": 0.954,
    "value": 1000
  },
  {
    "class": "appliance",
    "score": 0.8,
    "value": 100
  }
]
```
