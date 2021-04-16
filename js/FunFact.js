// DON'T LOOK AT THIS FILE UNLESS YOU WANT TO RUIN THE FUN FOR YOURSELF!

let a = [
    // Qualities
    ['Alignment', 'Chaotic Good'],
    ['Temperament', '98.6 °F'],
    ['Favorite Color', '512 nm <span style="color: #0fff00 !important; text-shadow: 2px 2px 0px var(--color-text);">■</span>'],
    ['Eye Color', 'Brown'],
    ['Corrective Lenses', '-0.5, +0.5 (I know, I know)'],
    ['Height', 'Exactly 1 Jonah'],
    ['Blood Type', 'Red'],
    ['Pronunciation of Gif', '<code>/dʒɪf/</code>'],
    ['Interpupillary Distance', '68 mm'],

    // Physics
    ['Preferred System of Units', 'Lorentz–Heaviside'],
    ['Preferred Unit of Mass', 'The Slug'],
    ['Preferred Unit of Energy', 'The Erg'],
    ['Favorite Simple Machine', 'The screw'],
    ['Favorite Actinide', '94 Am (Americium)'],
    ['Favorite Synthetic Element', '118 Og (Oganesson)'],
    ['Thoughts on the Anomalous Magnetic Dipole Moment', 'g\'s roughly 2; it\'s close enough in my book'],
    ['Thoughts on Magnetic Monopoles', 'They exist, but they\'re only rendered when we\'re not looking'],
    ['Status', 'Yet to reach max q'],

    // Programming
    ['Favorite ASCII character', '<code>0x07 \'BEL\'</code>'],
    ['Favorite C Keyword', '<code>for</code>'],
    ['Favorite Combinator', '<code>λf.(λx.f (x x)) (λx.f (x x))</code>'],
    ['Favorite Console Font', 'Iosevka SS03'],
    ['Favorite Encryption Algorithm', 'Rijndael'],
    ['Favorite Editor', 'VS Code'],
    ['Favorite Compiler', 'g++'],
    ['Favorite Worst Programming Language', 'DOS Batch Files'],
    ['Favorite Naming Convention', '<code>SCREAMING_SNAKE_CASE</code>'],
    ['Favorite Time Complexity', '<code>O(sqrt(n))</code>']
    ['Favorite Code Comment', '<code>// When I wrote this, only God and I understood what I was doing. Now, God only knows.</code>'],
    ['Favorite HTML Element', '<marquee direction="right"><code><b>&lt;marquee&gt;</b></code></marquee>']
    ['Thoughts on P vs NP Conjecture', 'Quantum computers will save us'],
    ['Light or Dark Theme?', 'Light theme'],
    ['Favorite Data Structure', 'The Treap'],

    // Math
    ['Favorite Integral', '<code>e^(-x^2)</code>'],
    ['Favorite Group', 'The Monster Group'],
    ['Favorite Set', 'ℂ'],
    ['Favorite Isomorphism', 'Curry-Howard'],
    ['Favorite Knot', 'Cinquefoil knot'],
    ['Mathematical Philosophy', 'Embodied mind'],
    ['Favorite theorem prover', 'z3'],
    ['Support of Inter-universal Teichmüller Theory', 'Tentative'],

    // Gaming
    ['Favorite Pokémon', 'Ten Question Marks'],
    ['Favorite NES Game', 'Kirby\'s Adventure'],
    ['Favorite Favorite Super Smash Bros. Stage', 'Minecraft World Ω-form'],
    ['Favorite Super Smash Bros. Character', 'Luigi'],
    ['Favorite Civ 5 leader', 'Bismarck'],
    ['Favorite TF2 class', 'Pyro'],
    ['Opinion on Fortnite', 'Apprehensive'],
    ['Favorite Among Us Map', 'The Airship'],
    ['Favorite Mario Kart Bike', 'Mach Bike'],
    ['Favorite Chess Opening', 'King\'s Knight Opening'],
    ['Favorite Chess Defense', 'Caro–Kann'],
    ['Favorite Games By Year', '<code>1400</code> - Chess <sup>Citation needed</sup><br><code>2012</code> - Fez<br><code>2018</code> - The Curse of the Obra Dinn<br><code>2020</code> - Half Life: Alyx'],
    ['Quickest Chess Loss', '<code>1. e4 e5 2. Bc4 Nc6 3. Qf3 Nf6 4. g4 d6 5. g5 Nd7 6. Qxf7#</code>'],

    // Music
    ['Favorite Chord', 'Dm7♭5'],
    ['Favorite Brass Instrument', 'Mellophone'],
    ['Favorite Scale', 'Phrygian Dominant (1 ♭2 3 4 5 ♭6 ♭7)'],
    ['Favorite Sound Chip', 'The Konami VRC6'],
    ['Preferred Chiptune Tracker Software', 'Famitracker'],
    ['Favorite Band', 'Red Vox'],
    ['Favorite Beach Boys Album', 'Pet Sounds'],
    ['Favorite DOOM music', 'Rip & Tear'],
    ['Favorite Music Symbol', '<span class="center-icon">𝇑</span> - The Gregorian F Clef'],
    ['Favorite Tuning System', 'A = 432Hz'],
    ['Favorite DCI Show', 'Metamorph - The Blue Devils 2017'],
    ['Sharps or Flats?', 'Flats'],
    ['Favorite Chord Progression', '<code>𝄁 E - G♯7 - 𝄀 E/C♯ D♯/C D/B D/E 𝄀 A - G♯m - 𝄀 F♯m B E - 𝄂</code>'],
    ['Favorite Jazz Lick', '<code>D E F G E C D</code>'],

    // Other / Favorites
    ['Favorite Humorist', 'Douglas Adams'],
    ['Favorite Netflix Show', 'BoJack Horseman'],
    ['Favorite Powerade Flavor', 'Grape'],
    ['Favorite Vowel Sound', '/ə/ (as in "rhythm")'],
    ['Favorite Soda', 'Coke Zero Sugar Caffeine Free'],
    ['Favorite Top Level Domain', '<code>.net</code> Quod potest videri'],
    ['Favorite Emoji Sequence', '👉😎👉'],
    ['Favorite Public Transit', 'The Chicago "L"'],
    ['<code style="font-size: 1.5rem; font-weight: bold;">59 6f 75 20 63 6f 6e 76 65 72 74 65 64 20 74 68 69 73 21</code>', '<code>48 65 72 65 2c 20 68 61 76 65 20 61 20 63 6f 6f 6b 69 65 20 🍪</code>']
    ['Opinion on Civil Engineers', 'Tolerable'],
    ['Preferred Drink', 'Sweet Tea '],
    ['Opinion on Pineapple on Pizza', 'I mean, it\'s not like it\'s pretending to be something other than what it is'],
    ['Favorite Vexillological Aspect Ratio', '2:1'],
    ['Favorite Compound Lift', 'The Squat'],
    ['Favorite Second Person Plural Pronoun', 'Y\'all'],
];

console.log('There are ' + a.length + ' fun facts about Jonah. Don\'t spoil it by looking at the source code!');

let $ = function(id) {
    return document.getElementById(id);
};

// Fisher-Yates shuffle
for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * a.length);
    let t = a[i];
    a[i] = a[j];
    a[j] = t;
}

let index = 0;
let count = 0;

function fun_fact() {
    count--;

    if (count <= 0) {
        index = (index + 1) % a.length;

        let title = a[index][0];
        let content = a[index][1];

        count = Math.max(Math.ceil((title.length + content.length) / 20), 6);

        $('fun-fact-title').innerHTML = title + ' <span style="color: var(--color-accent); font-size: 1rem;" id="fun-fact-counter"></span>';
        $('fun-fact-content').innerHTML = content;
    }

    $('fun-fact-counter').textContent = '' + (count - 1);
}

fun_fact();
window.setInterval(fun_fact, 1000);