console.log( "v3" );

const LOG_TO_CONSOLE_KEEPALIVE = false;
const USE_LOOP = false;

const thesaurus = {};
const words = {};
let lastWordIndex = 0;
const allWeightCounts = new Set();

window.onload = () => {

    startPopulatingThesaurusAndWords();

    document.querySelector( "input[type=button]" ).onclick = executeSearch;

}

function executeSearch() {
    
    const inputPrompt = '$' + document.querySelector( "input[type=text]" ).value;
    console.log( "Searching for ", inputPrompt );
    //const links = thesaurus.get( inputPrompt );
    const links = thesaurus[ inputPrompt ];
    console.log( "Got search: ", links );
    if( ! links ) return failSearch();
    populateSearchResults( Object.entries( links ).sort( (a,b)=>b[1]-a[1] ).map( e => `<span class="weight-${e[1]}">${e[0]} (${e[1]})</span>` ) );

}

function failSearch() {

    document.querySelector( "div" ).textContent = "No matches found.";

}

function populateSearchResults( links ) {
    
    document.querySelector( "div" ).innerHTML = links.join( " " ).replace( /\$/gmi, '' );

}

function showLinkingResult( i ) {

    const div = document.querySelector( "div" );
    const totalToLink = wordLines.length;
    const totalLinked = atLine + i;

    if( totalLinked < totalToLink ) {
        div.innerHTML = "Linking thesaurus, please wait... " + totalLinked + " / " + totalToLink;
        div.offsetHeight; //repaint
        if( LOG_TO_CONSOLE_KEEPALIVE ) console.log( "Linking thesaurus, please wait... " + totalLinked + " / " + totalToLink );
    }


    if( totalLinked >= totalToLink ) {
        div.innerHTML = "Ready to search, or download parsed thesaurus as JSON: <span>(compiling JSON)</span>";
        console.log( "Aggregating weight counts..." );
        //find out how many weight categories exist
        for( const head in thesaurus ) {
            for( const link in thesaurus[ head ] )
                allWeightCounts.add(  thesaurus[ head ][ link ] );
        }
        console.log( "Set of all weight counts: ", allWeightCounts );
        downloadParsedThesaurus();
    }



}

let wordLines, atLine = 0;
function startPopulatingThesaurusAndWords() {

    wordLines = thesaurusText.split( /[\f\r\n]+/gmi );
    requestAnimationFrame( loopPopulateThesaurusAndWords );

}

function loopPopulateThesaurusAndWords() {

    if( USE_LOOP && atLine < wordLines.length ) requestAnimationFrame( loopPopulateThesaurusAndWords );

    let startTime = performance.now();

    const frameLength = USE_LOOP ? 10 : 100;

    for( let i=0; ( atLine + i ) <= wordLines.length; i++ ) {

        if( ( performance.now() - startTime ) > frameLength ||  ( atLine + i ) >= wordLines.length ) {
            startTime = performance.now();
            if( USE_LOOP ) {
                atLine += i;
                break;
            }
            showLinkingResult( i );
        }
        if( ! USE_LOOP && ( atLine + i ) >= wordLines.length ) {
            showLinkingResult( i );
            break;
        }

        const wordLine = wordLines[ atLine + i ];
        const wordEntries = wordLine.split( /[\s]*,[\s]*/gmi );

        const headWord = '$' + wordEntries[ 0 ];
        if( words[ headWord ] === undefined ) words[ headWord ] = lastWordIndex++;
        if( ! thesaurus[ headWord ] ) thesaurus[ headWord ] = {};

        for( const rawWord of wordEntries ) {

            const word = '$' + rawWord;
            if( words[ word ] === undefined ) words[ word ] = lastWordIndex++;
            if( word !== headWord ) {
                if( ! thesaurus[ headWord ][ word ] ) thesaurus[ headWord ][word ] = 0;
                thesaurus[ headWord ][ word ] += 10;
            }

            if( ! thesaurus[ word ] ) thesaurus[ word ] = {};

            const wordLinks = thesaurus[ word ];

            for( const rawLinkedWord of wordEntries ) {
                const linkedWord = '$' + rawLinkedWord;
                if( linkedWord === word ) continue;
                
                let linkedWordIndex = words[ linkedWord ];
                if( linkedWordIndex === undefined ) {
                    linkedWordIndex = lastWordIndex++;
                    words[ linkedWord ] = linkedWordIndex;
                }

                if( ! wordLinks[ linkedWord ] ) wordLinks[ linkedWord ] = 0;
                ++wordLinks[ linkedWord ]
            }
        }

    }

    showLinkingResult( 0 );

}

/*

TODO: Load from image, store in-memory for search in typed array.
Part 1: A word list with a unique index for every word. (Done.) Can store as JSON, probably.
Part 2: A typed array thusly:
    <START_TAG:32-bit> <WORD_ID:24-bit, UNUSED:8-bit>
        <ASSOCIATED-WORD_ID:24-bit, SCORE:8-bit>
        <ASSOCIATED-WORD_ID:24-bit, SCORE:8-bit>
        etc...
    <START_TAG:32-bit> etc...
Part 3: Typed-array memory indices for each WORD_ID, attached to word list.
Part 4(ish): Typed array stored as pixels in PNG. What size is it??? We'll have to find out. :-)

*/


function downloadParsedThesaurus( linksArray ) {

    const div = document.querySelector( "div" );
    if( ! div.querySelector( "span" ) ) return; //link already visible?

    const jsonOpener = [
        "{",
        '"wordIndices":', JSON.stringify( words ),
        ",",
        '"links":{',
    ],
    jsonCloser = [
        "}}"
    ];

    const jsonArray = jsonOpener.concat( linksArray, jsonCloser );

    const blob = new Blob( jsonArray, { type:"text/json" } );
    const url = window.URL.createObjectURL( blob );
    const a = document.createElement( "a" );
    a.href = url;
    a.download = "thesaurus.json";
    //div.innerHTML = "";
    div.removeChild( div.querySelector( "span" ) );
    div.appendChild( a );
    a.textContent = "thesaurus.json";

}