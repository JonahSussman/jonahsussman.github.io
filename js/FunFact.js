let a = [
  ['Alignment', 'Chaotic Good']
, ['Temperament', '98.6 degrees fahrenheit']
, ['Favorite ASCII character', '0x07 \'BEL\'']
, ['Favorite C Keyword', '<code>for</code>']
, ['Favorite Integral', '<code>e^(-x^2)</code>']
, ['Favorite Humorist', 'Douglas Adams']
, ['Favorite Simple Machine', 'The screw']
, ['Favorite Pokémon', 'Ten Question Marks']
, ['Favorite NES Game', 'Kirby\'s Adventure']
, ['Favorite Group', 'The Monster Group']
, ['Favorite Combinator', '<code>λf.(λx.f (x x)) (λx.f (x x))</code>']
, ['Favorite Color', '512 nm']
, ['Favorite Math Symbol', 'ℝ']
, ['Favorite Netflix Show', 'BoJack Horseman']
, ['Favorite Console Font', 'Iosevka SS03']
, ['Favorite Isomorphism', 'Curry-Howard']
, ['Favorite Knot', 'Cinquefoil knot']
, ['Favorite Actinide', '94 Am (Americium)']
, ['Favorite Synthetic Element', '118 Og (Oganesson)']
, ['Favorite Chord', 'Dm7b5']
, ['Favorite Brass Instrument', 'Mellophone']
, ['Favorite Encryption Algorithm', 'Rijndael']
, ['Favorite Sound Chip', 'The Konami VRC6']
, ['Favorite Powerade Flavor', 'Grape']
, ['Favorite Vowel Sound', 'IPA /ə/ (as in "rhythm")']
, ['Favorite Soda', 'Coke Zero Sugar Caffeine Free']
, ['Favorite Band', 'Red Vox']
, ['Favorite Beach Boys Album', 'Pet Sounds']
, ['Favorite Top Level Domain', '.net']
, ['Favorite Favorite Super Smash Bros. Stage', 'Minecraft World Ω-form']
, ['Favorite Super Smash Bros. Character', 'Luigi']
, ['Favorite Editor', 'VS Code']
, ['Favorite Compiler', 'g++']
, ['Eye color', 'Brown']
, ['Corrective lenses', '-0.5, +0.5 (I know, I know)']
, ['Mathematical Philosophy', 'Embodied mind']
, ['Favorite theorem prover', 'z3']
, ['Height', '1 Jonah']
, ['Favorite Civ 5 leader', 'Bismarck ']
, ['Favorite TF2 class', 'Pyro']
, ['Blood type', 'Red']
, ['Favorite DOOM music', 'Rip & Tear']
, ['Favorite naming convention', '<code>SCREAMING_SNAKE_CASE</code>']
, ['Pronunciation of gif', '<code>/dʒɪf/</code>']
];

let i = Math.floor(Math.random() * a.length);

document.getElementById('fun-fact').innerHTML = 
  '<h3>' + a[i][0] + ' <span style="color: grey; font-size: 1rem; cursor: help;" title="Confused? Try refreshing the page!">(?)</span></h3><p class="container">' + a[i][1] + '</p>';