// Titles and order supplied by the artist. Durations and aspect ratios:
// public Vimeo oEmbed metadata. Dates and cities confirmed by the artist.
// Upload years are used ONLY for Zaruyar and On the Right Bank, as instructed.
const films = [
 {id:"394256229",ru:"Звери",en:"Animals",subtitleRu:"опыт визуального исследования",subtitleEn:"Visual study experience",dateRu:"2017-2020",dateEn:"2017-2020",cityRu:"Псков-Москва",cityEn:"Pskov-Moscow",duration:"04:30",ratio:"16 / 9"},
 {id:"272842965",ru:"Путешествие с комментариями",en:"Journey with Commentary",alternate:"Die Reise",dateRu:"август-январь 2017",dateEn:"August-January 2017",cityRu:"Санкт-Петербург, Псков, Москва",cityEn:"Saint Petersburg, Pskov, Moscow",duration:"28:24",ratio:"4 / 3"},
 {id:"885718308",ru:"Представление",en:"Presentation",subtitleRu:"опыт медиального реди-мейда",subtitleEn:"An Experiment in Media Readymade",dateRu:"ноябрь 2023",dateEn:"November 2023",cityRu:"Москва",cityEn:"Moscow",duration:"09:21",ratio:"16 / 9"},
 {id:"1008823051",ru:"Эллипс. Заруяр",en:"Ellipse. Zaruyar",dateRu:"2024",dateEn:"2024",cityRu:"Москва",cityEn:"Moscow",duration:"22:06",ratio:"16 / 9"},
 {id:"955510542",ru:"Я, Дерево",en:"I, Tree",dateRu:"2017-2024",dateEn:"2017-2024",cityRu:"Москва-Псков-Москва",cityEn:"Moscow-Pskov-Moscow",duration:"04:39",ratio:"16 / 9"},
 {id:"394965048",ru:"Я, настоящий",en:"Me, real",dateRu:"2018-2020",dateEn:"2018-2020",cityRu:"Москва-Псков-Москва",cityEn:"Moscow-Pskov-Moscow",duration:"03:00",ratio:"16 / 9"},
 {id:"230300417",ru:"Дерево и вода",en:"The tree and the water",dateRu:"август 2017",dateEn:"August 2017",cityRu:"Москва",cityEn:"Moscow",duration:"01:45",ratio:"4 / 3"},
 {id:"344560705",ru:"На правом берегу",en:"On the Right Bank",dateRu:"2019",dateEn:"2019",cityRu:"Москва",cityEn:"Moscow",roleRu:"режиссёр",roleEn:"director",duration:"38:17",ratio:"16 / 9"}
];
const turkishFilms=[
 {tr:"Hayvanlar",subtitleTr:"görsel bir araştırma denemesi",dateTr:"2017-2020",cityTr:"Pskov-Moskova"},
 {tr:"Yorumlarla Bir Yolculuk",dateTr:"Ağustos-Ocak 2017",cityTr:"Sankt-Peterburg, Pskov, Moskova"},
 {tr:"Sunum",subtitleTr:"medya alanında bir hazır nesne denemesi",dateTr:"Kasım 2023",cityTr:"Moskova"},
 {tr:"Elips. Zaruyar",dateTr:"2024",cityTr:"Moskova"},
 {tr:"Ben, Ağaç",dateTr:"2017-2024",cityTr:"Moskova-Pskov-Moskova"},
 {tr:"Ben, Gerçek",dateTr:"2018-2020",cityTr:"Moskova-Pskov-Moskova"},
 {tr:"Ağaç ve Su",dateTr:"Ağustos 2017",cityTr:"Moskova"},
 {tr:"Sağ Yakada",dateTr:"2019",cityTr:"Moskova",roleTr:"yönetmen"}
];
films.forEach((film,index)=>Object.assign(film,turkishFilms[index]));
const persianFilms=[
 {fa:"حیوانات",subtitleFa:"تجربه‌ای در پژوهش بصری",dateFa:"2017-2020",cityFa:"پسکوف-مسکو"},
 {fa:"سفری با توضیحات",dateFa:"اوت-ژانویهٔ 2017",cityFa:"سن‌پترزبورگ، پسکوف، مسکو"},
 {fa:"ارائه",subtitleFa:"تجربه‌ای در ردی‌مید رسانه‌ای",dateFa:"نوامبر 2023",cityFa:"مسکو"},
 {fa:"بیضی. زارویار",dateFa:"2024",cityFa:"مسکو"},
 {fa:"من، درخت",dateFa:"2017-2024",cityFa:"مسکو-پسکوف-مسکو"},
 {fa:"من، واقعی",dateFa:"2018-2020",cityFa:"مسکو-پسکوف-مسکو"},
 {fa:"درخت و آب",dateFa:"اوت 2017",cityFa:"مسکو"},
 {fa:"در کرانهٔ راست",dateFa:"2019",cityFa:"مسکو",roleFa:"کارگردان"}
];
const hebrewFilms=[
 {he:"חיות",subtitleHe:"ניסוי במחקר חזותי",dateHe:"2017-2020",cityHe:"פסקוב-מוסקבה"},
 {he:"מסע עם הערות",dateHe:"אוגוסט-ינואר 2017",cityHe:"סנקט פטרבורג, פסקוב, מוסקבה"},
 {he:"הצגה",subtitleHe:"ניסוי ברדי־מייד מדיה",dateHe:"נובמבר 2023",cityHe:"מוסקבה"},
 {he:"אליפסה. זארויאר",dateHe:"2024",cityHe:"מוסקבה"},
 {he:"אני, עץ",dateHe:"2017-2024",cityHe:"מוסקבה-פסקוב-מוסקבה"},
 {he:"אני, אמיתי",dateHe:"2018-2020",cityHe:"מוסקבה-פסקוב-מוסקבה"},
 {he:"העץ והמים",dateHe:"אוגוסט 2017",cityHe:"מוסקבה"},
 {he:"בגדה הימנית",dateHe:"2019",cityHe:"מוסקבה",roleHe:"במאי"}
];
films.forEach((film,index)=>Object.assign(film,persianFilms[index],hebrewFilms[index]));
