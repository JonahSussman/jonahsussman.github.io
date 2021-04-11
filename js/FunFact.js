let a = [
    // Qualities
    ['Alignment', 'Chaotic Good'],
    ['Temperament', '98.6 degrees fahrenheit'],
    ['Favorite Color', '512 nm <span style="color: #0fff00 !important; text-shadow: 2px 2px 0px #000;">■</span>'],
    ['Eye Color', 'Brown'],
    ['Corrective Lenses', '-0.5, +0.5 (I know, I know)'],
    ['Height', '1 Jonah'],
    ['Blood Type', 'Red'],
    ['Pronunciation of gif', '<code>/dʒɪf/</code>'],

    // Physics
    ['Preferred System of Units', 'Lorentz–Heaviside'],
    ['Preferred Unit of Mass', 'The Slug'],
    ['Preferred Unit of Energy', 'The Erg'],
    ['Favorite Simple Machine', 'The screw'],
    ['Favorite Actinide', '94 Am (Americium)'],
    ['Favorite Synthetic Element', '118 Og (Oganesson)'],

    // Programming
    ['Favorite ASCII character', '0x07 \'BEL\''],
    ['Favorite C Keyword', '<code>for</code>'],
    ['Favorite Combinator', '<code>λf.(λx.f (x x)) (λx.f (x x))</code>'],
    ['Favorite Console Font', 'Iosevka SS03'],
    ['Favorite Encryption Algorithm', 'Rijndael'],
    ['Favorite Editor', 'VS Code'],
    ['Favorite Compiler', 'g++'],
    ['Favorite Programming Language', 'DOS Batch Files'],
    ['Favorite naming convention', '<code>SCREAMING_SNAKE_CASE</code>'],

    // Math
    ['Favorite Integral', '<code>e^(-x^2)</code>'],
    ['Favorite Group', 'The Monster Group'],
    ['Favorite Set', 'ℂ'],
    ['Favorite Isomorphism', 'Curry-Howard'],
    ['Favorite Knot', 'Cinquefoil knot'],
    ['Mathematical Philosophy', 'Embodied mind'],
    ['Favorite theorem prover', 'z3'],

    // Gaming
    ['Favorite Pokémon', 'Ten Question Marks'],
    ['Favorite NES Game', 'Kirby\'s Adventure'],
    ['Favorite Favorite Super Smash Bros. Stage', 'Minecraft World Ω-form'],
    ['Favorite Super Smash Bros. Character', 'Luigi'],
    ['Favorite Civ 5 leader', 'Bismarck '],
    ['Favorite TF2 class', 'Pyro'],
    ['Opinion on Fortnite', 'Apprehensive'],
    ['Favorite Among Us Map', 'The Airship'],
    ['Favorite Mario Kart Bike', 'Mach Bike'],
    ['Favorite Chess Opening', 'King\'s Knight Opening'],
    ['Favorite Chess Defense', 'Caro–Kann'],
    ['Favorite Games By Year',
        '<code>1400</code> - Chess <sup>Citation needed</sup><br><code>2012</code> - Fez<br><code>2018</code> - The Curse of the Obra Dinn<br><code>2020</code> - Half Life: Alyx'
    ],

    // Music
    ['Favorite Chord', 'Dm7b5'],
    ['Favorite Brass Instrument', 'Mellophone'],
    ['Favorite Scale', 'Phrygian Dominant (1 b2 3 4 5 b6 b7)'],
    ['Favorite Sound Chip', 'The Konami VRC6'],
    ['Preferred Tracker Software', 'Famitracker'],
    ['Favorite Band', 'Red Vox'],
    ['Favorite Beach Boys Album', 'Pet Sounds'],
    ['Favorite DOOM music', 'Rip & Tear'],

    // Other / Favorites
    ['Favorite Humorist', 'Douglas Adams'],
    ['Favorite Netflix Show', 'BoJack Horseman'],
    ['Favorite Powerade Flavor', 'Grape'],
    ['Favorite Vowel Sound', 'IPA /ə/ (as in "rhythm")'],
    ['Favorite Soda', 'Coke Zero Sugar Caffeine Free'],
    ['Favorite Top Level Domain', '.net'],
    ['Favorite Emoji Sequence', '👉😎👉'],
    ['Favorite Public Transit', 'The Chicago "L"'],
];

let last_i = -1;
let count = 0;

function fun_fact() {
    count--;

    if (count > 0) {
        document.getElementById('fun-fact').innerHTML =
            '<h3>' + a[last_i][0] + ' <span style="color: grey; font-size: 1rem; cursor: help;" title="Confused? Try refreshing the page!">' + (count - 1) + '</span></h3><p class="container">' + a[last_i][1] + '</p>';

        return;
    }

    i = Math.floor(Math.random() * a.length);
    last_i = i;

    count = Math.max(Math.ceil((a[i][0].length + a[i][1].length) / 20), 6);
    document.getElementById('fun-fact').innerHTML =
        '<h3>' + a[i][0] + ' <span style="color: grey; font-size: 1rem; cursor: help;" title="Confused? Try refreshing the page!">' + (count - 1) + '</span></h3><p class="container">' + a[i][1] + '</p>';
}

fun_fact();
window.setInterval(fun_fact, 1000);