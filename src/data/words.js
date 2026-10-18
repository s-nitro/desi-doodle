// ─────────────────────────────────────────────────────────────
// WORD BANK. Easy to edit: comma separated, one string per category.
// "a|b|c" => "a" is shown to the drawer; a, b and c are ALL accepted as
// correct guesses (use it for spelling variants: shaadi|shadi, puja|pooja).
// Keep words drawable and familiar to Indian players.
// ─────────────────────────────────────────────────────────────
const raw = {
  school: {
    label: 'School', emoji: '🏫',
    words: `school,class,teacher,student,bench,blackboard,chalk,duster,notebook,pencil,eraser,sharpener,ruler,
      school bag|bag,uniform,tiffin|lunch box,school bell|bell,exam,homework,library,playground,assembly,principal,
      globe,compass,calculator,water bottle,id card,result,book,pen,desk,sports day,projector,school bus,tie,
      timetable,map,spectacles|glasses`,
  },
  home: {
    label: 'Home', emoji: '🏠',
    words: `house,door,window,ceiling fan|fan,cooler,bed,pillow,blanket,mat,chair,table,sofa,television|tv,remote,
      mobile phone|phone|mobile,charger,bucket,mug,broom,mop,washing machine,fridge|refrigerator,gas stove|stove,
      pressure cooker|cooker,tawa,kadhai,rolling pin|belan,ladder,inverter,key,lock,cupboard|almirah,mirror,
      wall clock|clock,bulb,switch,geyser,tap,balcony,terrace,gate,curtain,umbrella,chappal|slippers,shoes,
      matchbox,comb,soap,toothbrush,towel,scissors,needle,torch,iron`,
  },
  food: {
    label: 'Food', emoji: '🍛',
    words: `samosa,chai|tea,roti|chapati,rice,dal,paneer,dosa,idli,vada pav,pav bhaji,biryani,gulab jamun,jalebi,
      laddu,pani puri|golgappa,chaat,pakora|bhajia,paratha,naan,lassi,mango,banana,apple,coconut,watermelon,
      ice cream,chocolate,biscuit,cake,pizza,burger,noodles|maggi,egg,milk,butter,curd|dahi,onion,potato|aloo,
      tomato,chilli,ginger,popcorn,sandwich,peanuts,corn|bhutta,mithai|sweets,pickle|achar,papad,bhel puri,
      kulfi,rasgulla,dhokla,poha,sugarcane,grapes,orange,carrot,cauliflower,brinjal|baingan,garlic,lemon,pomegranate`,
  },
  animals: {
    label: 'Animals', emoji: '🐘',
    words: `cow,buffalo,dog,cat,elephant,tiger,lion,monkey,peacock,parrot,crow,sparrow,snake,camel,horse,goat,
      sheep,donkey,bull,rat,squirrel,fish,crocodile,frog,rabbit,deer,bear,owl,bat,butterfly,bee,ant,spider,
      mosquito,lizard,tortoise|turtle,pigeon,hen,duck,rooster,cobra,giraffe,zebra,snail,crab`,
  },
  transport: {
    label: 'Travel', emoji: '🚌',
    words: `car,bus,auto rickshaw|auto|rickshaw,train,bike|motorcycle,scooter,bicycle|cycle,truck,tractor,
      aeroplane|airplane|plane,helicopter,boat,ship,metro,taxi,ambulance,bullock cart,tempo,railway station,
      platform,traffic light|signal,petrol pump,helmet,ticket,bridge,road,tyre,horn,rocket,tunnel,flyover`,
  },
  places: {
    label: 'Places', emoji: '🛍️',
    words: `shop,market,temple,mosque,church,hospital,bank,post office,bus stop,cinema|theatre,park,garden,farm,
      village,city,river,beach,police station,mall,hotel,restaurant,fort,taj mahal,tea stall|chai stall,dhaba,
      salon|barber shop,tailor shop,kirana store,well,airport,stadium,zoo,museum,factory,jail,sabzi mandi`,
  },
  culture: {
    label: 'Desi', emoji: '🪔',
    words: `puja|pooja,shaadi|shadi|wedding,diwali|deepavali,holi,rangoli,diya,rakhi,eid,christmas,ganesh|ganpati,
      mehendi|henna,dhol,sitar,tabla,harmonium,bindi,saree|sari,kurta,turban|pagdi,dupatta,lehenga,bangles|chudi,
      sherwani,garland|mala,kite|patang,crackers|firecracker|fireworks,sparkler|phuljhadi,bhajan,yoga,namaste,
      bollywood,pandit,aarti,prasad,tilak,baraat,mangalsutra,tulsi,sadhu,bhangra,garba,rupee`,
  },
  sports: {
    label: 'Games', emoji: '🏏',
    words: `cricket,bat,ball,wicket|stumps,kabaddi,kho kho,carrom,ludo,chess,gilli danda,marbles|goli,seesaw,slide,
      football,badminton,hockey,tennis,skipping rope,spinning top|lattu,swimming,running,dancing,singing,
      hide and seek,kite flying,tug of war,race,medal,trophy,whistle,umpire,bowler,batsman,wrestling|kushti,archery`,
  },
  nature: {
    label: 'Nature', emoji: '🌳',
    words: `sun,moon,star,rain,cloud,rainbow,tree,flower,lotus,rose,leaf,banyan tree,mango tree,sea,mountain,fire,
      smoke,snow,lightning,wind,earth,pond,waterfall,desert,forest,grass,sand,stone,sunflower,thunder,flood,
      volcano,island,cave,palm tree`,
  },
  people: {
    label: 'People', emoji: '🧑',
    words: `doctor,police,farmer,driver,soldier,cook,milkman,postman,vegetable seller,barber,shopkeeper,king,thief,
      cricketer,actor,singer,baby,mother|mom|mummy,father|dad|papa,grandmother|dadi|nani,grandfather|dada|nana,
      brother,sister,magician,clown,engineer,nurse,painter,fisherman,eye,nose,ear,hand,leg,finger,tooth|teeth,
      hair,heart,smile,tongue`,
  },
  things: {
    label: 'Things', emoji: '🎒',
    words: `camera,laptop,headphones,watch,wallet,purse,battery,radio,balloon,gift,money|note,coin,handpump,thread,
      spoon,plate|thali,glass,bowl,knife,pot|matka,lamp,candle,flag,sword,crown,ring,necklace,earrings,suitcase,
      newspaper,letter,envelope,stamp,paintbrush,guitar,drum,flute|bansuri,telescope,magnet,trolley`,
  },
};

export const CATEGORIES = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => [
    k,
    { ...v, words: v.words.split(',').map((s) => s.trim().toLowerCase().split('|')).filter((e) => e[0]) },
  ])
);
export const ALL_CATS = Object.keys(CATEGORIES);

// primary word -> [primary, ...accepted alternates]
export const ANSWERS = {};
Object.values(CATEGORIES).forEach((c) => c.words.forEach((e) => { ANSWERS[e[0]] = e; }));
