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
    words: `puja|pooja,shaadi|shadi|wedding,diwali|deepavali,holi,rangoli,diya,rakhi,eid,christmas,ganesh chaturthi|ganpati festival,
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
  clothes: {
    label: 'Clothes', emoji: '👕',
    words: `shirt,t-shirt|tshirt,pant|trousers,jeans,shorts,skirt,frock|dress,jacket,sweater,shawl,muffler|scarf,cap,hat,
      socks,sandals,sneakers,school shoes,belt,blazer,coat,raincoat,hoodie,pyjamas|pajamas,blouse,salwar kameez|salwar,
      churidar,palazzo,kurti,anarkali,gown,dhoti,lungi,kurta pyjama,nehru jacket,topi,sunglasses,jewellery,nose pin,
      anklet|payal,bracelet,hairband,hair clip,ribbon,handkerchief|hanky,apron,lab coat,costume,button,zip|zipper,
      pocket,collar,sleeve,sewing machine,mojari|jutti,kolhapuri chappal,jhumka,maang tikka,kajal`,
  },
  actions: {
    label: 'Actions', emoji: '🤸',
    words: `sleeping,eating,drinking,running,walking,jumping,climbing,crying,laughing,sneezing,yawning,coughing,reading,
      writing,drawing,painting,cooking,cleaning,sweeping,washing clothes,bathing,brushing teeth,combing hair,praying,
      cycling,driving,flying,farming,shopping,counting,throwing,catching,kicking,pushing,pulling,lifting,digging,
      planting,watering plants,cutting,sewing,playing,fighting,hugging,waving,clapping,thinking,dreaming,shaking hands,
      saluting,bowing,whispering,shouting,winking,pointing,sitting,falling,slipping,hiding,searching,waiting,
      celebrating,blowing candles,cutting cake,making roti,flying a kite,playing cricket,selfie,video call,
      standing in line,traffic jam,crossing the road,climbing stairs,knocking,ringing the bell,fishing`,
  },
  india: {
    label: 'India', emoji: '🇮🇳',
    words: `taj mahal,india gate,gateway of india,red fort,qutub minar,charminar,hawa mahal,lotus temple,golden temple,
      howrah bridge,marine drive,ganga river,kerala houseboat,backwaters,bengal tiger,national flag|tiranga,
      ashoka chakra,rupee note,kulhad,street food,chai wala,bangle shop,mandap,wedding card|invitation card,
      band baja,haldi,sangeet,saat phere|pheras,mehendi function,film poster,cinema ticket,hero,villain,
      republic day,independence day,gandhi topi,charkha|spinning wheel,paan,paan shop,kolam,dandiya,kathak,
      bharatanatyam,ghungroo,shehnai,dholak,veena,santoor,damru,puppet show|kathputli,snake charmer,madari,
      street play,rath yatra,kumbh mela,gulal|holi colours,pichkari,diwali lamps,kandil|lantern,anar|flower pot,chakri`,
  },
};


// Extra words merged into the categories above (duplicates are removed automatically).
const more = {
  school: `pencil box,geometry box,protractor,set square,graph paper,sketch pen,crayons,colour pencils,paint brush,
    water colour,glue,stapler,paper clip,whiteboard,marker,textbook,atlas,dictionary,register,school gate,school van,
    morning prayer,national anthem,flag hoisting,exam hall,question paper,answer sheet,report card,parent teacher meeting,
    monitor,class teacher,prefect,science lab,microscope,test tube,skeleton,magnifying glass,periodic table,alphabet,
    multiplication table,abacus,fountain pen|ink pen,school picnic,annual day,fancy dress,drawing class,canteen,water cooler,
    cycle stand,black board,roll number,sports period,detention,topper,bunking,tuition,coaching class,school trip`,
  home: `kitchen,bedroom,bathroom,toilet,drawing room,pooja room,store room,roof,staircase,lift,doorbell,doormat,cot,mattress,
    bedsheet,wardrobe,dressing table,bookshelf,shelf,carpet,tube light,table fan,air conditioner|ac,heater,clothesline,
    clothes peg,hanger,shampoo,toothpaste,razor,dustbin,vacuum cleaner,mixer grinder|mixer,microwave,toaster,kettle,pan,
    ladle,spatula,steel glass,water filter,water tank,gas cylinder,lighter,agarbatti|incense stick,photo frame,calendar,
    cradle,mosquito net,mosquito coil,shoe rack,letter box,swing|jhula,sofa set,dining table,tiffin box,flower pot,
    washing powder,scrubber,bucket and mug,slipper,hot water bag,extension board,plug,socket,remote control,wall hook`,
  food: `chole bhature,rajma,kadhi,sambar,rasam,uttapam,medu vada,appam,puri,aloo paratha,butter chicken,tandoori chicken,
    chicken,mutton,fish curry,egg curry,omelette,boiled egg,fried rice,pulao,khichdi,curd rice,lemon rice,thali,raita,
    salad,chutney,bhakri,thepla,khakhra,pav,bread,jam,toast,cornflakes,sheera,halwa,gajar halwa,kheer|payasam,barfi,peda,
    sandesh,rasmalai,imarti,modak,gujiya,mysore pak,soan papdi,chikki,til laddu,kaju katli,jaggery|gud,sugar,salt,oil,
    ghee,honey,flour|atta,dry fruits,cashew,almond,raisin,dates,walnut,pistachio,coconut water,nimbu pani|lemonade,
    jaljeera,buttermilk|chaas,badam milk,thandai,cold drink,soda,juice,coffee,filter coffee,masala chai,aloo tikki,
    dahi puri,sev puri,dabeli,kachori,momos,spring roll,french fries,hot dog,egg roll,kathi roll,pasta,soup,paneer tikka,
    kebab,bhindi|okra,spinach|palak,peas,beans,cabbage,radish,beetroot,cucumber,pumpkin,bottle gourd|lauki,
    bitter gourd|karela,drumstick,green chilli,coriander,mint,curry leaves,turmeric,cardamom,cloves,cinnamon,black pepper,
    cumin,mustard seeds,tamarind,guava,papaya,pineapple,jackfruit,litchi|lychee,custard apple,strawberry,cherry,peach,
    pear,plum,fig,kiwi,jamun,chikoo,muskmelon,raw mango,amla,sweet potato,mushroom,tandoori roti,gol gappa water,
    pani,cutlet,bonda,murukku,sev,namkeen,pav bun,vada,bhel,jhalmuri,litti chokha,puran poli,rabri,falooda,ice gola|gola`,
  animals: `leopard,cheetah,panther,jackal,fox,wolf,hyena,rhino|rhinoceros,hippo,gorilla,chimpanzee,panda,koala,kangaroo,
    polar bear,penguin,seal,dolphin,whale,shark,octopus,starfish,jellyfish,seahorse,eel,prawn,lobster,swan,eagle,vulture,
    hawk,kingfisher,woodpecker,cuckoo|koel,mynah|myna,flamingo,pelican,stork,crane,hummingbird,goose,turkey,ostrich,
    puppy,kitten,calf,lamb,chick,cub,grasshopper,dragonfly,firefly,caterpillar,cockroach,housefly|fly,scorpion,centipede,
    earthworm,ladybug,wasp,beehive,spider web,python,chameleon,ox,yak,mule,pony,bison,langur,stray dog,pet,crow and pitcher,
    elephant calf,baby,lion cub,tiger cub,rabbit hole,bird nest,fish tank,aquarium fish,goldfish,camel cart,bullock`,
  transport: `bullet train,local train,train engine,railway track,railway crossing,coolie,bus conductor,double decker bus,
    e-rickshaw|electric rickshaw,cycle rickshaw,jeep,van,lorry,dumper truck,jcb|excavator,crane,road roller,fire engine,
    police jeep,steering wheel,gear,brake,speedometer,petrol,diesel,cng,number plate,zebra crossing,speed breaker,road sign,
    milestone,highway,toll gate,parking,garage,driving license,seat belt,skateboard,roller skates,hot air balloon,parachute,
    jet,fighter jet,satellite,space shuttle,astronaut,submarine,speedboat,sailboat,houseboat,shikara,ropeway|cable car,
    escalator,tonga|horse cart,palanquin|palki,car wash,puncture,mechanic shop,railway signal,guard,ticket counter,
    luggage,suitcase on wheels,airport,runway,cockpit,seat,window seat,upper berth,sleeper class,horn please`,
  places: `college,university,office,gym,swimming pool,cricket ground,gurudwara,ashram,ghat,river bank,bus stand,taxi stand,
    post box,atm,medical shop|chemist,grocery store,bakery,sweet shop,book shop,cloth shop,jewellery shop,mobile shop,
    cycle shop,repair shop,laundry,flower shop,fruit stall,fish market,bazaar,supermarket,amusement park,water park,circus,
    fair|mela,exhibition,aquarium,planetarium,court,fire station,guest house,hostel,resort,campsite|camp,tent,hut,palace,
    apartment,skyscraper,tower,lighthouse,dam,canal,field,paddy field,sugarcane field,tea garden,orchard,cowshed,
    petrol station,toll plaza,bus depot,railway colony,school ground,bridge,cave,island,market street,gali|lane,chowk,
    colony,society gate,lift lobby,parking lot,rooftop,veranda|verandah,courtyard|aangan`,
  culture: `toran,kalash,havan,ganga aarti,navratri,durga puja,dussehra,ravan dahan,om,swastik,trishul,conch|shankh,
    temple bell,rudraksha,golden temple,minaret,cross,janmashtami,dahi handi,makar sankranti,pongal,onam,baisakhi,lohri,
    bihu,ugadi,gudi padwa,bhai dooj,karva chauth,chhath,ramzan,christmas tree,santa claus,new year,gandhi,sindoor,kumkum,
    nose ring|nath,payal,glass bangles,pyjama,pagdi,pheta,nehru jacket,dandiya,kathak,kathakali,ghungroo,sarangi,flute,
    shehnai,ektara,mridangam,folk dance,magic show,monkey show,tamasha,mela,fireworks,rocket,diya stand,matka,
    dahi,lassi glass,rakhi thread,sweet box,mehendi cone,reception,groom,bride,mandap,sherwani,lehenga`,
  sports: `cricket bat,cricket ball,wicketkeeper,fielder,six,four,run out,catch,bouncer,pads,gloves,scoreboard,pitch,boundary,
    toss,world cup,goalpost,goalkeeper,referee,penalty,red card,yellow card,corner kick,basketball,volleyball,handball,
    table tennis|ping pong,golf,boxing,karate,judo,weightlifting,gymnastics,skating,cycling,marathon,high jump,long jump,
    javelin,shot put,hurdles,relay race,sack race,lemon spoon race,musical chairs,pass the parcel,antakshari,dumb charades,
    tic tac toe,snakes and ladders,playing cards|cards,dice,carrom board,striker,yo-yo,rubik cube,jigsaw puzzle,building blocks,
    toy car,doll,teddy bear,toy train,rocking horse,merry go round,giant wheel|ferris wheel,roller coaster,bumper cars,
    pitthu|seven stones,hopscotch,fishing,kite fighting,gully cricket,tennis ball,tube light bat,stumps and bails,
    super over,hat trick,golden duck,stadium,coach,captain,twelfth man,drinks break,third umpire,dugout,jersey,cheerleader`,
  nature: `sunrise,sunset,full moon,crescent moon,eclipse,shooting star,milky way,planet,saturn,comet,galaxy,sky,night,
    morning,evening,fog|mist,dew,hail,storm,cyclone,tornado,earthquake,landslide,drought,monsoon,summer,winter,autumn,
    puddle,stream,lake,ocean,wave,tide,coast,rock,boulder,hill,valley,cliff,glacier,iceberg,snowman,snowflake,icicle,
    himalaya,jungle,bamboo,neem tree,peepal tree,coconut tree,banana tree,rice plant|paddy,wheat,cotton,tea plant,
    marigold,jasmine|mogra,hibiscus|gudhal,lily,tulip,cactus,bush,creeper,seed,sapling,root,branch,bark,fruit,nest,
    honeycomb,anthill,footprint,shadow,bonfire,campfire,sparks,rainy day,umbrella in rain,paper boat,mud,clay,
    dust,sandstorm,heat wave,cold wave,north star,sun and moon,day and night,planet earth,solar system`,
  people: `carpenter,plumber,electrician,mechanic,tailor,cobbler,potter,blacksmith,goldsmith,washerman|dhobi,watchman|security guard,
    gardener,sweeper,waiter,chef,baker,butcher,salesman,delivery boy,courier,vendor,fruit seller,flower seller,
    balloon seller,tea seller|chaiwala,newspaper boy,pilot,air hostess,captain,sailor,scientist,professor,lawyer,judge,
    dentist,surgeon,vet,architect,programmer,photographer,reporter,news anchor,dancer,musician,acrobat,juggler,uncle,
    aunt,cousin,twins,son,daughter,husband,wife,bride,groom,newborn,boy,girl,man,woman,old man,old woman,queen,prince,
    princess,robber,ghost,witch,angel,fairy,giant,genie,superhero,robot,alien,pirate,eyebrow,eyelash,lips,cheek,chin,
    forehead,neck,shoulder,elbow,knee,ankle,toe,thumb,palm,fist,nail,beard,moustache,bald,skin,bone,muscle,brain,stomach,
    fingerprint,sneeze,yawn,shopkeeper uncle,traffic police,bus driver,rickshaw driver,tea vendor,cricket fan,bride and groom`,
  things: `hammer,screwdriver,spanner|wrench,saw,drill,nail,screw,axe,shovel|spade,plough,sickle,rope,chain,wheel,brick,cement,
    paint can,measuring tape,pliers,toolbox,wire,fuse,solar panel,generator,windmill,pipe,computer,keyboard,mouse,monitor,
    printer,scanner,pen drive,wifi,router,tablet,smart watch,earphones,speaker,microphone,dish antenna,antenna,cctv camera,
    file,folder,rubber stamp,diary,alarm clock,hourglass,binoculars,lantern,raincoat,sunglasses,hat,backpack,keychain,
    visiting card,passport,atm card,piggy bank,gold,diamond,pearl,treasure chest,shield,bow and arrow,trumpet,piano,violin,
    harmonica,party hat,birthday cake,greeting card,photo,album,painting,statue,poster,sticker,mask,toy,scarecrow,signboard,
    tv remote,mobile charger,power bank,bluetooth speaker,selfie stick,game controller,video game,cd,cassette,walkman,
    typewriter,tape recorder,landline phone,sewing needle,safety pin,rubber band,paper plane,paper boat,kite string|manja`,
};

const parse = (str) =>
  str.split(',').map((x) => x.trim().toLowerCase().split('|').map((w) => w.trim())).filter((e) => e[0]);

export const CATEGORIES = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => {
    const seen = new Set();
    const words = parse(v.words + ',' + (more[k] || '')).filter((e) => !e[0].includes('?') && !seen.has(e[0]) && seen.add(e[0]));
    return [k, { ...v, words }];
  })
);
export const ALL_CATS = Object.keys(CATEGORIES);

// primary word -> [primary, ...accepted alternates]
export const ANSWERS = {};
Object.values(CATEGORIES).forEach((c) => c.words.forEach((e) => { ANSWERS[e[0]] = [...new Set([...(ANSWERS[e[0]] || []), ...e])]; }));
