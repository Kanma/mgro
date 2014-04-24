# Marvel Graphical Reading Order

An experimentation to display a graph of Marvel comics in their order of reading, using
both the data from the *Marvel API* (http://developer.marvel.com/) and the order provided
by *The Complete Marvel Reading Order (CMRO)* (http://cmro.travis-starnes.com) as a basis.

The idea is to use the characters present in each comic to determine the relation between
them, not only the suggested reading order.


## Usage

The graph can be seen at http://kanma.github.io/mgro/ (Only the 400 first comics are
displayed at the moment).

Use your mouse wheel to zoom in to display more details (title, date, characters) about
each comic.

The scripts that generate this HTML page will be released at a later date.


## Challenges encountered

* *CMRO* and the *Marvel API* doesn't use the same naming conventions for series, so I had
  to (semi-manually) build a conversion table
* *CMRO* references a lot of comics not present in the *Marvel API*: on a total of 10149
  in the order (from 1961 to 1993), 2722 weren't found. I guess most of them are from very
  short series.
* Character informations for each comic in the API isn't consistent (at least for those
  early days, I didn't looked at recent issues yet). This has a big impact on the graph of
  course. For instance:
  * *Fantastic Four (1961) #1* mentions *The Fantastic Four*, *Human Torch*, *Mr Fantastic*
    and *The Thing* (not *Invisible Girl*)
  * *Fantastic Four (1961) #2* mentions *The Fantastic Four*, *The Thing* and *The Skrulls*
    (not *Invisible Girl*, *Human Torch* and *Mr Fantastic*)
  * *Fantastic Four (1961) #3* mentions *The Fantastic Four* and *Mr Fantastic* (not
    *Invisible Girl*, *Human Torch* and *Thing*)
  * At those times, the *Human Torch* had a lot of solo adventures in *Strange Tales*, so
    in the graph it looks like he wasn't a member of the group, joined them in *Fantastic
    Four (1961) #9* and left again
  * Sometimes the bad guy is mentioned (*Dr Doom*), most of the time he isn't


## Possible enhancements

* The lines should be drawn as curves (B-splines), which explains why some of them looks
  strange
* Clicking on a comic should display a lot of details about it
* It should be possible to filter the display, to make some comics stands out visually
  (for instance: "all comics with Spider-Man")
