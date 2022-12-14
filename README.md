This script loads the Moby thesaurus (~24MB), and links words:  
- If A > is a synonym of B > is a synonym of C,  
- Then A > is a synonym of C  
Word links are weighted by frequency of found links.

The linked thesaurus is searchable or downloadable as JSON (~1.3GB)  
It is not a practical tool for use, due to the long time necessary to build the links before searching, and due to the large memory requirements.

It has been modified as a browser load-test. Animation-frame loop segmenting and logging to the console have been disabled to render the page unresponsive during initialization. User agents will react differently, including potentially: Asking the user to stop the script or triggering an out-of-memory error.

The Moby Thesaurus is in the public domain: https://github.com/words/moby  
(Although the license and project info formerly hosted at https://icon.shef.ac.uk/Moby/ no longer exists.)  

This project is similarly released into the public domain using the Unlicense.
