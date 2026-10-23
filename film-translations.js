// Draft translations. Existing artist-supplied English titles are preserved.
// Veps remains an explicitly disclosed Russian fallback until native review.
const newFilmTranslations={
 zh:["动物","带评论的旅行","呈现","椭圆。扎鲁亚尔","我，树","我，真实的","树与水","在右岸","视觉研究实验","媒介现成品实验"],
 es:["Animales","Viaje con comentarios","Presentación","Elipse. Zaruyar","Yo, Árbol","Yo, real","El árbol y el agua","En la orilla derecha","Una experiencia de investigación visual","Un experimento de readymade mediático"],
 ar:["حيوانات","رحلة مع تعليقات","تقديم","قطع ناقص. زارويار","أنا، شجرة","أنا، الحقيقي","الشجرة والماء","على الضفة اليمنى","تجربة في البحث البصري","تجربة في الريدي ميد الإعلامي"],
 fr:["Animaux","Voyage avec commentaires","Présentation","Ellipse. Zaruyar","Moi, Arbre","Moi, réel","L’arbre et l’eau","Sur la rive droite","Une expérience de recherche visuelle","Une expérience de ready-made médiatique"],
 pt:["Animais","Viagem com comentários","Apresentação","Elipse. Zaruyar","Eu, Árvore","Eu, real","A árvore e a água","Na margem direita","Uma experiência de investigação visual","Uma experiência de readymade mediático"],
 de:["Tiere","Reise mit Kommentaren","Präsentation","Ellipse. Zaruyar","Ich, Baum","Ich, wirklich","Der Baum und das Wasser","Am rechten Ufer","Ein Versuch visueller Forschung","Ein Experiment mit medialem Readymade"],
 hi:["जानवर","टिप्पणियों के साथ यात्रा","प्रस्तुति","दीर्घवृत्त। ज़ारुयार","मैं, पेड़","मैं, असली","पेड़ और पानी","दाएँ किनारे पर","दृश्य अनुसंधान का एक प्रयोग","मीडिया रेडीमेड का एक प्रयोग"],
 bn:["প্রাণীরা","মন্তব্যসহ যাত্রা","উপস্থাপনা","উপবৃত্ত। জারুয়ার","আমি, গাছ","আমি, আসল","গাছ ও জল","ডান তীরে","দৃশ্যগত গবেষণার একটি পরীক্ষা","মিডিয়া রেডিমেডের একটি পরীক্ষা"],
 ja:["動物たち","コメント付きの旅","プレゼンテーション","楕円。ザルヤール","私、木","本当の私","木と水","右岸で","視覚研究の試み","メディア・レディメイドの試み"],
 be:["Звяры","Падарожжа з каментарыямі","Прадстаўленне","Эліпс. Заруяр","Я, Дрэва","Я, сапраўдны","Дрэва і вада","На правым беразе","вопыт візуальнага даследавання","вопыт медыяльнага рэды-мэйда"],
 uk:["Звірі","Подорож із коментарями","Представлення","Еліпс. Заруяр","Я, Дерево","Я, справжній","Дерево і вода","На правому березі","досвід візуального дослідження","досвід медіального реді-мейду"],
 kk:["Жануарлар","Түсініктемелері бар саяхат","Таныстырылым","Эллипс. Заруяр","Мен, Ағаш","Мен, шынайы","Ағаш пен су","Оң жағалауда","визуалды зерттеу тәжірибесі","медиалық реди-мейд тәжірибесі"],
 ky:["Жаныбарлар","Комментарийлер менен саякат","Тааныштыруу","Эллипс. Заруяр","Мен, Дарак","Мен, чыныгы","Дарак жана суу","Оң жээкте","визуалдык изилдөө тажрыйбасы","медиалык реди-мейд тажрыйбасы"],
 uz:["Hayvonlar","Izohlar bilan sayohat","Taqdimot","Ellips. Zaruyar","Men, Daraxt","Men, haqiqiy","Daraxt va suv","O‘ng sohilda","vizual tadqiqot tajribasi","media redimeyd tajribasi"],
 tg:["Ҳайвонот","Сафар бо шарҳҳо","Муаррифӣ","Эллипс. Заруяр","Ман, Дарахт","Ман, воқеӣ","Дарахт ва об","Дар соҳили рост","таҷрибаи таҳқиқоти визуалӣ","таҷрибаи реди-мейди медиавӣ"],
 tk:["Haýwanlar","Teswirler bilen syýahat","Tanyşdyryş","Ellips. Zaruýar","Men, Agaç","Men, hakyky","Agaç we suw","Sag kenarda","wizual gözleg tejribesi","media redimeýd tejribesi"],
 az:["Heyvanlar","Şərhlərlə səyahət","Təqdimat","Ellips. Zaruyar","Mən, Ağac","Mən, həqiqi","Ağac və su","Sağ sahildə","vizual tədqiqat təcrübəsi","media redimeyd təcrübəsi"],
 hy:["Կենդանիներ","Ճանապարհորդություն մեկնաբանություններով","Ներկայացում","Էլիպս։ Զարույար","Ես, Ծառ","Ես, իսկական","Ծառը և ջուրը","Աջ ափին","տեսողական հետազոտության փորձ","մեդիա ռեդի-մեյդի փորձ"],
 ro:["Animale","Călătorie cu comentarii","Prezentare","Elipsă. Zaruyar","Eu, Copac","Eu, adevărat","Copacul și apa","Pe malul drept","o experiență de cercetare vizuală","un experiment de readymade mediatic"],
 ka:["ცხოველები","მოგზაურობა კომენტარებით","პრეზენტაცია","ელიფსი. ზარუიარი","მე, ხე","მე, ნამდვილი","ხე და წყალი","მარჯვენა ნაპირზე","ვიზუალური კვლევის ცდა","მედია რედიმეიდის ცდა"]
};
const translatedCities={
 zh:["普斯科夫","莫斯科","圣彼得堡"],es:["Pskov","Moscú","San Petersburgo"],ar:["بسكوف","موسكو","سانت بطرسبرغ"],fr:["Pskov","Moscou","Saint-Pétersbourg"],pt:["Pskov","Moscovo","São Petersburgo"],de:["Pskow","Moskau","Sankt Petersburg"],
 hi:["प्सकोव","मॉस्को","सेंट पीटर्सबर्ग"],bn:["পস্কভ","মস্কো","সেন্ট পিটার্সবার্গ"],ja:["プスコフ","モスクワ","サンクトペテルブルク"],be:["Пскоў","Масква","Санкт-Пецярбург"],uk:["Псков","Москва","Санкт-Петербург"],kk:["Псков","Мәскеу","Санкт-Петербург"],ky:["Псков","Москва","Санкт-Петербург"],uz:["Pskov","Moskva","Sankt-Peterburg"],tg:["Псков","Маскав","Санкт-Петербург"],tk:["Pskow","Moskwa","Sankt-Peterburg"],az:["Pskov","Moskva","Sankt-Peterburq"],hy:["Պսկով","Մոսկվա","Սանկտ Պետերբուրգ"],ro:["Pskov","Moscova","Sankt Petersburg"],ka:["ფსკოვი","მოსკოვი","სანქტ-პეტერბურგი"]
};
Object.entries(newFilmTranslations).forEach(([code,copy])=>{
 const suffix=code[0].toUpperCase()+code.slice(1);
 const [pskov,moscow,petersburg]=translatedCities[code];
 const month=number=>new Intl.DateTimeFormat(code,{month:"long",timeZone:"UTC"}).format(new Date(Date.UTC(2023,number-1,1)));
 const dates=["2017-2020",`${month(8)}-${month(1)} 2017`,`${month(11)} 2023`,"2024","2017-2024","2018-2020",`${month(8)} 2017`,"2019"];
 const cities=[`${pskov}-${moscow}`,`${petersburg}, ${pskov}, ${moscow}`,moscow,moscow,`${moscow}-${pskov}-${moscow}`,`${moscow}-${pskov}-${moscow}`,moscow,moscow];
 films.forEach((film,index)=>{
  film[code]=copy[index];film["date"+suffix]=dates[index];film["city"+suffix]=cities[index];
  if(index===0)film["subtitle"+suffix]=copy[8];
  if(index===2)film["subtitle"+suffix]=copy[9];
 });
});
// The artist distinguishes the title from its subtitle on both gallery and detail pages.
const journeyParts={
 ru:["Путешествие","с комментариями"],en:["Journey","with commentary"],
 zh:["旅行","带评论"],es:["Viaje","con comentarios"],ar:["رحلة","مع تعليقات"],
 fa:["سفر","با توضیحات"],he:["מסע","עם הערות"],fr:["Voyage","avec commentaires"],
 pt:["Viagem","com comentários"],de:["Reise","mit Kommentaren"],
 da:["Rejse","med kommentarer"],sv:["En resa","med kommentarer"],nb:["En reise","med kommentarer"],
 fi:["Matka","kommentteineen"],is:["Ferð","með athugasemdum"],et:["Reis","kommentaaridega"],
 lv:["Ceļojums","ar komentāriem"],lt:["Kelionė","su komentarais"],tr:["Bir Yolculuk","yorumlarla"],
 hi:["यात्रा","टिप्पणियों के साथ"],bn:["যাত্রা","মন্তব্যসহ"],ja:["旅","コメント付き"],
 be:["Падарожжа","з каментарыямі"],uk:["Подорож","із коментарями"],
 kk:["Саяхат","түсініктемелерімен"],ky:["Саякат","комментарийлер менен"],
 uz:["Sayohat","izohlar bilan"],tg:["Сафар","бо шарҳҳо"],tk:["Syýahat","teswirler bilen"],
 az:["Səyahət","şərhlərlə"],hy:["Ճանապարհորդություն","մեկնաբանություններով"],
 ro:["Călătorie","cu comentarii"],ka:["მოგზაურობა","კომენტარებით"]
};
Object.entries(journeyParts).forEach(([code,[title,subtitle]])=>{
 const suffix=code[0].toUpperCase()+code.slice(1);
 films[1][code]=title;films[1]["subtitle"+suffix]=subtitle;
 const zaruyar=films[3][code]?.match(/^(.*?)\s*[.。։।]\s*(.+)$/u);
 if(zaruyar){films[3][code]=zaruyar[2];films[3]["subtitle"+suffix]=zaruyar[1].toLocaleLowerCase(code)}
});
