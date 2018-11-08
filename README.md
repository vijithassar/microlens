# microlens

handy shortcuts for navigating complex nested data structures in JavaScript

## Wait Wat

**Lenses** are tools that simplify traversal of complicated data structures, so named because they quickly **focus** on only the relevant parts of the data. They are extremely cool. You may have encountered them in [Haskell](https://www.haskell.org/) or the [Ramda.js](https://ramdajs.com/) functional programming toolkit for JavaScript, but each of those comes with a lot of baggage. In contrast, this module aims to provide a lightweight implementation and expose only a minimal surface API to your calling programs.

# Quick Start

Given a data object:

```json
{
  "user_info": {
    "id": "11A237D57F76",
    "age": 27,
    "links": [
      "https://www.example.com/document/8723498",
      "https://www.example.com/document/1767832"
    ]
  }
}
```

Create a handy accessor function for reading from and writing to it:

```javascript
// create a lens function by supplying keys for
// traversing the data object
const first_link = lens(['user_info', 'links', 0])

// get the existing value
first_link(user) // returns "https://www.example.com/document/8723498"

// set a new value; will create objects and arrays
// as necessary to satisfy traversal path without
// requiring any existential checks
first_link(user, "https://www.example.com/document/2378432")
```

# Installation

install the package from the npm command line:

```bash
# install microlens package
$ npm install microlens
```

import the module into your JavaScript file:

```javascript
// as ES6 module
import { lens } from 'microlens'

// or

// import as CommonJS module
const lens = require('microlens').lens
```

# But Why Tho

Have you ever needed to work with a data structure -- maybe a response from a JSON API -- that includes a lot of extra stuff you don't need?

Perhaps you feel the urge to quickly transform it before you pass it to the rest of your program:

```javascript
// fetch data to work with from somewhere else
const data = retrieve(url)
const clean = data.map(item => {
  // clean up and drop the unnecessary information
})
// now proceed with the rest of your program
program(clean)
```

Unfortunately this means you are immediately working with a proprietary and idiosyncratic version of the data.

Or maybe you leave the original data as is and use it by specifying object and array keys:

```javascript
// extract a URL from the data
const firstUserHomepageUrl = data.users[0].links.homepage.url
// render a link in your program using the URL
renderLink(firstUserHomepageUrl)
```

This approach is also problematic because it **couples your application logic to the data structure**, which means your program will break if anything changes with the incoming data. In the example above, the `renderLink()` function doesn't *really* care about the JSON structure, but it is likely to break because the structure of the data being stored hasn't really been decoupled from the application logic. This makes things brittle, and especially so if you have to look up the same nested accessors repeatedly. If you need to get that homepage URL more than once, you'll need to use that gross string of keys several times, each of which will separately break if the incoming data structure ever changes.

There is a better way to do this!

First, lenses **centralize** the accessor logic you need to traverse a data structure in a single function which is more easily maintained and reusable.

```javascript
// create a lens function to extract
// the URL from the data
const getUrl = lens(['users', 0, 'links', 'homepage', 'url'])
// extract the URL and render a link in your program
renderLink(getUrl(data))
```

Since lenses are functions, you can **compose** them.

```javascript
// create a lens function to extract the top user
// from an input data set
const topUser = lens(['users', 'ranked', 0])
// create a lens function to extract the country
// from a data record representing a user
const userCountry = lens(['location', 'address', 'country'])
// compose lenses to get the country of the top ranked user in a data set
const topUserCountry = input => userCountry(topUser(input)))
```

That `topUserCountry()` function is equivalent to `['users']['ranked'][0]['location']['address']['country']`, but working with it is a lot more pleasant, and now your extraction logic can be used with different inputs.

```javascript
// get some top ranked user locations
console.log(topUserCountry(tetrisPlayers)) // Russia maybe? Just a guess.
console.log(topUserCountry(pizzaLovers)) // Italy maybe? Just a guess.
```

Lenses work both ways, and can also be used as **setters**:

```javascript
// here comes a new challenger!
topUserCountry(tetrisPlayers, newTetrisChampion)
```

microlens assumes that you are confident in the traversal path across the data structure you specified with keys when creating your lens function, and will follow it in order to set values even if empty objects and arrays have to be created along the way in order to adhere to it. This means the data structures will be **consistent**. (If you are not confident in the traversal path specified by the keys, you may want to consider a different solution.)

Because microlens creates objects and arrays as necessary during traversal for a set operation, you will **never have to use existential checks** when setting values that might not be set yet. For example, if directly using the keys corresponding to the `topUserCountry()` function in the earlier example, you'd need some extremely verbose defensive coding to make sure you don't end up with an undefined key error. If the top pizza lover moved to a new country, in order to defensively catch any undefined keys you'd need to do something like this (not a joke, this is the real syntax):

```javascript
if (pizzaLovers.users) {
  if (pizzaLovers.users.ranked) {
    if (pizzaLovers.users.ranked.length > 0) {
      if (pizzaLovers.users.ranked[0].location {
        if (pizzaLovers.users.ranked[0].location {
          if (pizzaLovers.users.ranked[0].location.address) {
            if (pizzaLovers.users.ranked[0].location.address.country) {
              return pizzaLovers.users.ranked[0].location.address.country
            }
          }
        }
      }
    }
  }
}
```

This is so obnoxious that [optional chaining](https://github.com/tc39/proposal-optional-chaining) was proposed as a change to the JavaScript language itself in order to help deal with it!

In contrast, doing the same thing with a lens function is clear and concise:

```javascript
// you can even start with a completely empty root data object
const pizzaLovers = {}
// set new value with a lens
topUserCountry(pizzaLovers, "Brazil")
// all the necessary objects and arrays are automatically created
pizzaLovers.users.ranked[0].location.address // {country: "Brazil"}
```

# Creating A Lens

To create a new lens function, just call `lens()` with one argument, which is an array of the keys you want to look up when getting or setting the value.

```javascript
// get or set the first favorite food listed
// in a user object
const favoriteFood = lens(['foods', 'favorites', 0])

// get or set the name of the third place winner
// of the most recent annual contest
const mostRecentThirdPlaceWinner = lens(['winners', 'years', 0, 2, 'name'])
```

# Using Lenses

To *get* a value from a data structure, just provide the data structure to the lens function as the first argument.

```javascript
// get a user's favorite food
favoriteFood(user) // Pizza? Just a guess.
```

To *set* a value inside a data structure, provide the data structure as the first argument and the new value as the second argument.

```javascript
// set a user's favorite food
favoriteFood(user, "chicken tikka masala")
```

The return value of a set operation is the original data structure with the new value updated.

# Immutable Data

Functional programming in JavaScript is delightful, but even though functional programming prefers immutable data structures, in JavaScript the data is often only treated as immutable *by convention*, because deep cloning of nested data structures is hard, `Object.freeze()` is shallow, and so on. Enforcing true immutability is beyond the scope of a lens library like this one, but if you have a solution for immutable data that works for your use case, you can *attach* it to any lenses you can create, in which case it will be run at the end after setting a value so as to return an immutable copy of the input data, however you've defined "immutable" in your project.

To force a lens to return a copy of your input data structure without mutating the original, provide the lens creation function with a second parameter, which is a function for taking input data and returning a copy of it:

```javascript
// create a copy of the data by casting it to a JSON
// string and then immediately parsing that string
const copy = data => JSON.parse(JSON.stringify(data)

// supply the function to copy data to the lens creation function
const favoriteFoodImmutable = lens(['foods', 'favorites', 0], copy)
```

Some of your options for deep copying and immutability include:

- `JSON.stringify()` to encode and parse data as a serialized string
- `Array.prototype.slice()` for shallow copying of arrays
- `_.clone()` from [Underscore](https://underscorejs.org/#clone)
- `_.cloneDeep()` from [lodash](https://lodash.com/docs/4.17.10#cloneDeep)
- [Immutable.js](https://github.com/facebook/immutable-js)
- [seamless-immutable](https://github.com/rtfeldman/seamless-immutable)
- [devalue](https://github.com/Rich-Harris/devalue) for a version of the JSON serialization trick that supports more JavaScript idiosyncrasies

Good luck!

# Composing Lenses

Lenses are just functions, so you can compose them!

You can compose lenses manually if you want to tap into the logic along the way to add additional control flow or tooling. If you're only using your lenses as getters, this can be done with a one-line arrow function:

```javascript
// quickly compose several lenses into a getter
const topUserCountry = input => userCountry(topUser(input)))
```

To compose lenses for use as setters or with immutable data, microlens supplies an optional composition helper function which `<FAMOUS LAST WORDS>` handles all the edge cases `</FAMOUS LAST WORDS>` and will be easier than manual composition in most cases. To use the composition helper, just pass it an array of lenses. The array should read from left to right, with the most general lens that operates first listed first in the array. Your composed lens will be immutable if that broadest lens listed first in the array (`topGame()`, in this example) was created with a data copying function.

```javascript
// import the composition helper function
import { compose } from 'microlens'
// define an array of lenses
const lenses = [topGame, topPlayer, country]
// compose the new lens
const composition = compose(lenses)
```

The composition helper function has been [thoroughly annotated](./source/compose.js) so it can serve as effective documentation if you'd like to implement your own bespoke composition logic.
