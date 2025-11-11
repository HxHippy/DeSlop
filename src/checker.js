// De-Slop Interactive Checker - "Is My Post Slop?"

// Pattern definitions (same as content.js)
const PATTERNS = {
  tier1: [
    // Signature AI phrases
    /\bdelve into\b/gi,
    /\bdelving into (the )?(intricacies|complexities)\b/gi,
    /\bnavigat(e|ing) (the|this) (complex )?(landscape|realm|world)\b/gi,
    /\bin (today's|the) (rapidly )?evolving (landscape|world|market|era)\b/gi,
    /\bin today's (digital|modern|fast-paced) (world|landscape|era)\b/gi,
    /\bembark on (a|this|your) journey\b/gi,
    /\btapestry of\b/gi,
    /\brealm of possibilities\b/gi,
    /\bthe (beauty|power|importance) lies in\b/gi,
    /\bultimately,? (the )?(choice|decision) is yours\b/gi,
    /\bmultifaceted (nature|approach|aspect)\b/gi,
    /\bholistic(ally)? (approach|perspective|view)\b/gi,
    /\bseamlessly integrat(e|ing|ed)\b/gi,
    /\bunlock (the potential|new possibilities|unprecedented)\b/gi,
    /\bfoster (innovation|growth|collaboration)\b/gi,
    /\bintricate (details|balance|web)\b/gi,
    /\bnuanced (understanding|approach|perspective)\b/gi,
    /\bmeticulous (attention|planning|care)\b/gi,
    /\bever-evolving (landscape|world|field)\b/gi,
    /\bdynamic (environment|landscape|nature)\b/gi,
    /\bpivotal (role|moment|point)\b/gi,
    /\bin the grand scheme of things\b/gi,
    /\bcornerstones? of\b/gi,
    /\bkey takeaways?\b/gi,
    /\bexplore (the|various) facets of\b/gi,
    /\btransformative (power|potential|impact|insights)\b/gi,
    /\bgame-?chang(er|ing)\b/gi,
    /\bparadigm shift\b/gi,
    /\bgroundbreaking\b/gi,
    /\bunprecedented\b/gi,
    /\brobust (solution|framework|system|approach)\b/gi,
    /\bcomprehensive (guide|overview|analysis|approach)\b/gi,
    /\bleverage (the power|cutting-edge)\b/gi,
    /\bit'?s (important|worth|essential) to (note|consider|understand) that\b/gi,
    /\bin this article,? (we will|we'll|I'll|I will)\b/gi,
    /\bthroughout (this|the) (article|guide|post)\b/gi,
    /\bas an AI (language model|assistant)\b/gi,
    /\bI (don't|do not|cannot|can't) have (personal|real-time|access to)\b/gi,
    /\bcannot be overstated\b/gi,
    /\bdeep dive into\b/gi,
    /\bshed(ding)? light on\b/gi,
    /\bunparalleled\b/gi,
    /\btreasure trove\b/gi,
    /\buncharted waters\b/gi,
    /\bstate-of-the-art\b/gi,
    /\bcutting[- ]edge\b/gi,
    /\bnext frontier\b/gi,
    /\bthought[- ]provoking\b/gi,
    /\bat the end of the day\b/gi,
    /\baction(able)? insights?\b/gi,
    /\bin conclusion\b/gi,
    /\bin summary\b/gi,
    /\bto summarize\b/gi,
    /\bmoving forward\b/gi,
    /\bgoing forward\b/gi,
    
    // Structural patterns
    /^(In conclusion|In summary|To summarize|Ultimately),?\s/mi,
    /\bNot only .{10,50} but (also)?\b/gi,
    /\bIt'?s not (just )?about .{5,30},? it'?s\b/gi,
    /\bDespite (its|their) .{5,30},? .{5,30} faces? challenges?\b/gi,
    /\bFuture Prospects?:?\b/gi,
    
    // Excessive transition words
    /\b(Furthermore|Moreover|Additionally|Consequently|Nevertheless|Nonetheless),?\s/gi,
    
    // Generic openers
    /^(As |In |With |Through |During |From ).{20,60}(continues? to|has become|have become|is becoming)\b/mi,
    /^In today's .{10,40} world,?\s/mi,
    
    // Listicle patterns
    /\b\d+\s+(ways|reasons|tips|tricks|secrets|hacks|benefits|advantages)\s+to\b/gi,
    /\b(Top|Best)\s+\d+\b/gi,
    /\bUltimate guide to\b/gi,
    /\bEverything you need to know about\b/gi,
    /\bBeginner'?s guide to\b/gi,
    
    // Unearned profundity
    /\bSomething shifted\b/gi,
    /\bEverything changed\b/gi,
    /\bBut here'?s the thing\b/gi,
    /\bHere'?s what (I|you|we) learned\b/gi,
    
    // AI content mill phrases
    /\bbreakthrough(s)?\b/gi,
    /\bgiant leap\b/gi,
    /\bexciting (possibilities|advances|opportunities|future)\b/gi,
    /\bdazzling (pace|speed|rate)\b/gi,
    /\bthrilling time to be alive\b/gi,
    /\badvanced .{5,30} (technology|system|solution|method)\b/gi,
    /\bstunning (results|advances|breakthroughs|discoveries)\b/gi,
    /\breal[- ]world (impact|advances|applications|use)\b/gi,
    /\bpositioning .{5,30} as game[- ]changer/gi,
    /\bpace is accelerat(ing|ed)\b/gi,
    /\bcould soon become\b/gi,
    /\bopens .{5,30} possibilities\b/gi,
    /\breignites? debates? about\b/gi,
    /\bneed for new (regulations|laws|rules|policies)\b/gi,
    /\brewriting (history|the books)\b/gi,
    /\bprompting new questions about\b/gi,
    /\bit'?s clear that\b/gi,
    /\btruly (is|are) a .{5,30} time\b/gi,
    /\bwhether it'?s .{10,50} or .{10,50}, it\b/gi,
    /\bfrom .{5,30} to .{5,30}, (it|this|these)\b/gi,
    /\bIntroducing .{5,30}, the (first|next|future)\b/gi,
    /\bImagine .{10,50} — that'?s\b/gi,
    /\bFor (decades|years), .{10,50} seemed like\b/gi,
    /\bin 20\d{2}, it'?s\b/gi,
    /\bNot all .{5,30} discoveries are\b/gi,
    /\bscience fiction .{5,30} but in 20\d{2}\b/gi,
    
    // Additional AI-generated content tells
    /\blandscape is (constantly|rapidly|continuously) (changing|evolving|shifting)\b/gi,
    /\bever[- ]changing (world|landscape|environment)\b/gi,
    /\bfast[- ]paced (world|environment|landscape)\b/gi,
    /\bcrucial (to understand|to note|to recognize|that)\b/gi,
    /\bvital (to understand|to note|to recognize|that)\b/gi,
    /\bimportant to (understand|note|recognize|remember) that\b/gi,
    /\bworth noting that\b/gi,
    /\bit'?s worth mentioning\b/gi,
    /\bone (must|should) (consider|understand|recognize)\b/gi,
    /\bproven track record\b/gi,
    /\blong[- ]standing (tradition|practice|history)\b/gi,
    /\btime[- ]tested\b/gi,
    /\btried and (true|tested)\b/gi,
    /\bstand(s)? the test of time\b/gi,
    /\bexciting times ahead\b/gi,
    /\bbright future ahead\b/gi,
    /\bpromising future\b/gi,
    /\blooking ahead\b/gi,
    /\bas we look (to the future|forward|ahead)\b/gi,
    /\bshape the future of\b/gi,
    /\bfuture of .{5,30} (is|looks|appears)\b/gi,
    /\bpoised to (become|transform|revolutionize)\b/gi,
    /\bset to (become|transform|revolutionize)\b/gi,
    /\bon the (brink|cusp|verge) of\b/gi,
    /\bheralds? a new (era|age|chapter)\b/gi,
    /\buses?her(s|ing)? in a new (era|age|chapter)\b/gi,
    /\bmarks? a (turning|pivotal) point\b/gi,
    /\bwatershed moment\b/gi,
    /\binflection point\b/gi,
    /\btipping point\b/gi,
    /\bperfect storm of\b/gi,
    /\bconvergence of\b/gi,
    /\bintersection of\b/gi,
    /\bat the (crossroads|forefront|vanguard) of\b/gi,
    /\bspearhead(ing)? (the|a)\b/gi,
    /\bchampion(ing)? (the|a)\b/gi,
    /\bpioneer(ing)? (the|a|new)\b/gi,
    /\btrailblaz(er|ing)\b/gi,
    /\bindustry[- ]leading\b/gi,
    /\bmarket[- ]leading\b/gi,
    /\bworld[- ]class\b/gi,
    /\bbest[- ]of[- ]breed\b/gi,
    /\bcutting[- ]edge (technology|solution|approach|innovation)\b/gi,
    /\bbleeding[- ]edge\b/gi,
    /\bstate[- ]of[- ]the[- ]art (technology|solution|system)\b/gi,
    /\bnext[- ]generation (technology|solution|platform)\b/gi,
    /\bfuture[- ]proof(ing)?\b/gi,
    /\bforward[- ]thinking\b/gi,
    /\bvisionary (approach|leadership|thinking)\b/gi,
    /\bmission[- ]critical\b/gi,
    /\bbusiness[- ]critical\b/gi,
    /\bstrategic (imperative|importance|priority)\b/gi,
    /\bkey (driver|enabler|differentiator)\b/gi,
    /\bfundamental(ly)? (different|transform)\b/gi,
    /\bradical(ly)? (different|transform|change)\b/gi,
    /\bdramatic(ally)? (different|improve|increase)\b/gi,
    /\bsignificant(ly)? (improve|enhance|boost)\b/gi,
    /\bmassive(ly)? (improve|scale|grow)\b/gi,
    /\bexponential (growth|increase|improvement)\b/gi,
    /\bunique (opportunity|position|advantage)\b/gi,
    /\bdistinctive (feature|advantage|capability)\b/gi,
    /\bcompelling (reason|case|argument)\b/gi,
    /\bconvincing (evidence|case|argument)\b/gi,
    /\boverwhelmingly (positive|successful|clear)\b/gi,
    /\bundeniab(ly|le)\b/gi,
    /\birrefutabl(y|e)\b/gi,
    /\bincontrovertib(ly|le)\b/gi,
    /\bunequivocal(ly)?\b/gi,
    /\bdefinitively\b/gi,
    /\bcategorically\b/gi,
    /\bundoubtedly\b/gi,
    /\bwithout (a )?doubt\b/gi,
    /\bbeyond (a|any) (shadow of a )?doubt\b/gi,
    /\bneedles to say\b/gi,
    /\bit goes without saying\b/gi,
    /\bsuffice (it )?to say\b/gi,
    /\blong story short\b/gi,
    /\bto make a long story short\b/gi,
    /\bcutting to the chase\b/gi,
    /\bbottom line is\b/gi,
    /\bnet[- ]net\b/gi,
    /\ball things considered\b/gi,
    /\btaking everything into (account|consideration)\b/gi,
    /\bat this (point in time|juncture)\b/gi,
    /\bcurrent(ly)? in the (process|midst) of\b/gi,
    /\bgaining (traction|momentum)\b/gi,
    /\bpicking up (steam|speed|momentum)\b/gi,
    /\bon an upward trajectory\b/gi,
    /\bupward trend\b/gi,
    /\bskyrocket(ing)?\b/gi,
    /\bsurg(e|ing)\b/gi,
    /\bexplosive growth\b/gi,
    /\bmeteoric rise\b/gi,
    /\bunprecedented growth\b/gi,
    /\bunparalleled success\b/gi,
    /\brecord[- ]breaking\b/gi,
    /\ball[- ]time (high|low|record)\b/gi,
    /\bbar[- ]setting\b/gi,
    /\bbenchmark[- ]setting\b/gi,
    /\bindustry[- ]defining\b/gi,
    /\bmarket[- ]defining\b/gi,
    /\bcategory[- ]defining\b/gi
    
    // Marketing engagement stop words and em dashes moved to separate arrays below for independent toggling
  ],
  tier2: [
    /\bsynergy\b/gi,
    /\bleverage\b/gi,
    /\bcircle back\b/gi,
    /\blow[- ]hanging fruit\b/gi,
    /\bmove the needle\b/gi,
    /\bthink outside the box\b/gi,
    /\btouch base\b/gi,
    /\btake (it|this) offline\b/gi,
    /\bpivot\b/gi,
    /\bdisrupt(ive)?\b/gi,
    /\bscale\b/gi,
    /\bagile\b/gi,
    /\bbandwidth\b/gi,
    /\bcore competenc(y|ies)\b/gi,
    /\bstakeholders?\b/gi,
    /\bvalue[- ]add\b/gi,
    /\bthought leader(ship)?\b/gi,
    /\bbest practices?\b/gi,
    /\bblue[- ]sky thinking\b/gi,
    /\bboil the ocean\b/gi,
    /\bdrink the kool[- ]aid\b/gi,
    /\bducks in a row\b/gi,
    /\blow[- ]level\b/gi,
    /\bhigh[- ]level\b/gi,
    /\b30,?000[- ]foot view\b/gi,
    /\bideate\b/gi,
    /\boperationalize\b/gi,
    /\bsocialize\b/gi,
    /\bright[- ]?siz(e|ing)\b/gi,
    /\bin the weeds\b/gi,
    /\bon (my|your|our) radar\b/gi,
    /\bseat at the table\b/gi,
    /\bskin in the game\b/gi,
    /\brun (it )?up the flagpole\b/gi,
    /\bthrow under the bus\b/gi,
    /\brock ?star\b/gi,
    /\bninja\b/gi,
    /\bguru\b/gi,
    /\bbig data\b/gi,
    /\bdigital transformation\b/gi,
    /\bAI[- ]powered\b/gi,
    /\bcloud[- ]based\b/gi,
    /\bblockchain[- ]enabled\b/gi,
    /\bnext[- ]gen(eration)?\b/gi,
    /\bdata[- ]driven\b/gi,
    /\bcustomer[- ]centric\b/gi,
    /\bvalue proposition\b/gi,
    /\bcompetitive (advantage|landscape)\b/gi,
    /\bmarket (share|penetration|trends?)\b/gi,
    /\bROI\b/gi,
    /\bKPI\b/gi,
    /\bSLA\b/gi,
    /\bMVP\b/gi,
    /\bPOC\b/gi,
    /\bdeep dive\b/gi,
    /\bdouble click\b/gi,
    /\bdeliverables?\b/gi,
    /\baction items?\b/gi,
    /\bwheelhouse\b/gi,
    /\bnimble\b/gi,
    /\bempower(ment)?\b/gi,
    /\bdriv(e|ing) innovation\b/gi,
    /\bfostering\b/gi,
    /\benhance\b/gi,
    /\boptimize\b/gi,
    /\bstreamline\b/gi,
    /\bmaximize\b/gi,
    
    // Additional corporate buzzwords
    /\balignment\b/gi,
    /\balign(ing|ed) (with|to|on)\b/gi,
    /\bget (on|aligned on) the same page\b/gi,
    /\bsing from the same (hymn|song) (sheet|book)\b/gi,
    /\bget everyone on board\b/gi,
    /\bwin[- ]win\b/gi,
    /\bgain[- ]gain\b/gi,
    /\bmutually beneficial\b/gi,
    /\bpartnerships?\b/gi,
    /\bcollaborate\b/gi,
    /\bcross[- ]functional\b/gi,
    /\bcross[- ]pollination\b/gi,
    /\bhorizontal integration\b/gi,
    /\bvertical integration\b/gi,
    /\bend[- ]to[- ]end (solution|platform)\b/gi,
    /\bone[- ]stop[- ]shop\b/gi,
    /\bturnkey (solution|platform)\b/gi,
    /\bplug[- ]and[- ]play\b/gi,
    /\bout[- ]of[- ]the[- ]box\b/gi,
    /\bbaked[- ]in\b/gi,
    /\bnative(ly)? (support|integrate)\b/gi,
    /\bfirst[- ]class (support|citizen)\b/gi,
    /\bfull[- ]stack\b/gi,
    /\bhands[- ]on deck\b/gi,
    /\brolling up (our|my) sleeves\b/gi,
    /\brolls[- ]royce (of|standard)\b/gi,
    /\bgold standard\b/gi,
    /\bbest[- ]in[- ]class\b/gi,
    /\bworld[- ]beating\b/gi,
    /\btop[- ]tier\b/gi,
    /\bpremium (quality|tier|offering)\b/gi,
    /\benterprise[- ]grade\b/gi,
    /\bproduction[- ]ready\b/gi,
    /\bbattle[- ]tested\b/gi,
    /\bfield[- ]tested\b/gi,
    /\bproven (solution|platform|methodology)\b/gi,
    /\bvirtual(ly)? seamless\b/gi,
    /\bfriction(less)?\b/gi,
    /\bpainless\b/gi,
    /\beffortless(ly)?\b/gi,
    /\btransparent(ly)?\b/gi,
    /\bvisibility\b/gi,
    /\bobservability\b/gi,
    /\btelemetry\b/gi,
    /\binstrument(ation|ed)?\b/gi,
    /\bmetrics[- ]driven\b/gi,
    /\bmeasurable (impact|results|outcomes)\b/gi,
    /\bquantifiable (impact|results|benefits)\b/gi,
    /\bactionable (insights?|data|intelligence)\b/gi,
    /\bdata[- ]backed\b/gi,
    /\bevidence[- ]based\b/gi,
    /\bscientific (approach|method)\b/gi,
    /\bfirst principles\b/gi,
    /\bfrom the ground up\b/gi,
    /\bpurpose[- ]built\b/gi,
    /\btailor[- ]made\b/gi,
    /\bcustomized (solution|approach|strategy)\b/gi,
    /\bbespoke\b/gi,
    /\bwhite[- ]glove (service|treatment)\b/gi,
    /\bconcierge (service|level|tier)\b/gi,
    /\bpremium (service|support|experience)\b/gi,
    /\b24\/7\b/gi,
    /\baround[- ]the[- ]clock\b/gi,
    /\balways[- ]on\b/gi,
    /\b99\.9+%? (uptime|availability)\b/gi,
    /\bhigh[- ]availability\b/gi,
    /\bmission[- ]critical\b/gi,
    /\bfault[- ]tolerant\b/gi,
    /\bself[- ]healing\b/gi,
    /\bauto[- ]scaling\b/gi,
    /\belastic(ally)?\b/gi,
    /\bon[- ]demand\b/gi,
    /\bpay[- ]as[- ]you[- ]go\b/gi,
    /\bsubscription[- ]based\b/gi,
    /\bSaaS\b/gi,
    /\bPaaS\b/gi,
    /\bIaaS\b/gi,
    /\bXaaS\b/gi,
    /\bAs[- ]a[- ]Service\b/gi,
    /\bAPI[- ]first\b/gi,
    /\bmobile[- ]first\b/gi,
    /\bcloud[- ]first\b/gi,
    /\bcloud[- ]native\b/gi,
    /\bcontainerized\b/gi,
    /\bmicroservices\b/gi,
    /\bserverless\b/gi,
    /\bevent[- ]driven\b/gi,
    /\basync(hronous)?\b/gi,
    /\breal[- ]time\b/gi,
    /\binstant(ly)?\b/gi,
    /\blightning[- ]fast\b/gi,
    /\bblazing(ly)?[- ]fast\b/gi,
    /\bmillisecond (response|latency)\b/gi,
    /\blow[- ]latency\b/gi,
    /\bhigh[- ]performance\b/gi,
    /\bperformant\b/gi,
    /\bscalable\b/gi,
    /\bmodular\b/gi,
    /\bextensible\b/gi,
    /\bflexible\b/gi,
    /\badaptable\b/gi,
    /\bversatile\b/gi,
    /\bno[- ]code\b/gi,
    /\blow[- ]code\b/gi,
    /\bdrag[- ]and[- ]drop\b/gi,
    /\bpoint[- ]and[- ]click\b/gi,
    /\buser[- ]friendly\b/gi,
    /\bintuitive\b/gi,
    /\bseamless (experience|integration|workflow)\b/gi
  ],
  tier3: [
    /\bfree\b/gi,
    /\bguaranteed\b/gi,
    /\bamazing\b/gi,
    /\bincredible\b/gi,
    /\bunbelievable\b/gi,
    /\bmind[- ]blowing\b/gi,
    /\brevolutionary\b/gi,
    /\bmiracle\b/gi,
    /\bbest[- ]in[- ]class\b/gi,
    /\btop[- ]of[- ]the[- ]line\b/gi,
    /\bstate[- ]of[- ]the[- ]art\b/gi,
    /\bclick here\b/gi,
    /\bbuy now\b/gi,
    /\bact (now|immediately)\b/gi,
    /\blimited time offer\b/gi,
    /\bdon'?t wait\b/gi,
    /\bonce in a lifetime\b/gi,
    /\bno strings attached\b/gi,
    /\brisk[- ]free\b/gi,
    /\bdouble your income\b/gi,
    /\bmake money\b/gi,
    /\bearn money\b/gi,
    /\bfast cash\b/gi,
    /\bproven results\b/gi,
    /\bspecial promotion\b/gi,
    /\bsave big\b/gi,
    /\blowest price\b/gi,
    /\bbest (deal|price|offer)\b/gi,
    /\bno cost\b/gi,
    /\bfree consultation\b/gi,
    /\bexpertly curated\b/gi,
    /\bmust[- ]have\b/gi,
    /\bnext[- ]level\b/gi,
    /\braise(d)? the bar\b/gi,
    /\bstand out from the crowd\b/gi,
    /\bspread like wildfire\b/gi,
    /\btake .{5,30} (to the next level|by storm)\b/gi,
    /\bthrow .{5,30} against the wall\b/gi,
    /\btip of the iceberg\b/gi,
    /\bunder the radar\b/gi,
    /\bcontent is king\b/gi,
    /\bSEO is dead\b/gi,
    /\bkiller (content|anything)\b/gi,
    /\bhit the ground running\b/gi,
    /\bfrom the (beginning of time|dawn of man)\b/gi,
    /\bthe fact of the matter is\b/gi,
    /\bthe long and short of it\b/gi,
    /\bwhen all is said and done\b/gi,
    /\bin a nutshell\b/gi,
    /\bbasically\b/gi,
    /\bessentially\b/gi,
    /\bactually\b/gi,
    
    // Additional marketing spam and weak language
    /\bawesome\b/gi,
    /\bfantastic\b/gi,
    /\bspectacular\b/gi,
    /\bphenomenal\b/gi,
    /\boutstanding\b/gi,
    /\bexceptional\b/gi,
    /\bextraordinary\b/gi,
    /\bremarkable\b/gi,
    /\bstunning\b/gi,
    /\bwonderful\b/gi,
    /\bsuperb\b/gi,
    /\bexquisite\b/gi,
    /\bmagnificent\b/gi,
    /\bglorious\b/gi,
    /\bsplendid\b/gi,
    /\bterrific\b/gi,
    /\bmarvelous\b/gi,
    /\bsensational\b/gi,
    /\bimpressive\b/gi,
    /\bawe[- ]inspiring\b/gi,
    /\bbreathtaking\b/gi,
    /\blife[- ]changing\b/gi,
    /\bgame[- ]changing\b/gi,
    /\bworld[- ]changing\b/gi,
    /\binsane(ly)?\b/gi,
    /\bcrazy (good|fast|powerful)\b/gi,
    /\bsick (deals?|features?)\b/gi,
    /\bepic\b/gi,
    /\blegendary\b/gi,
    /\bmythical\b/gi,
    /\bunicorn\b/gi,
    /\b10x\b/gi,
    /\b100x\b/gi,
    /\bmillion dollar\b/gi,
    /\bbillion dollar\b/gi,
    /\bfortune 500\b/gi,
    /\bwall street\b/gi,
    /\bsilicon valley\b/gi,
    /\bsecret(s)? (to|of)\b/gi,
    /\bhidden (secrets?|gems?|treasures?)\b/gi,
    /\binsider (secrets?|tips?|knowledge)\b/gi,
    /\bexclusive (access|offer|deal|content)\b/gi,
    /\bmembers[- ]only\b/gi,
    /\bVIP (access|membership|treatment)\b/gi,
    /\binvite[- ]only\b/gi,
    /\belite (group|club|members)\b/gi,
    /\binner circle\b/gi,
    /\btop 1%\b/gi,
    /\bhigh[- ]earners?\b/gi,
    /\bsuper[- ]users?\b/gi,
    /\bpower[- ]users?\b/gi,
    /\bearly (adopters?|access|bird)\b/gi,
    /\bfirst movers?\b/gi,
    /\bground floor\b/gi,
    /\bget in (now|early|first)\b/gi,
    /\bdon'?t miss out\b/gi,
    /\bFOMO\b/gi,
    /\bfear of missing out\b/gi,
    /\bwhile (supplies|stocks?) last\b/gi,
    /\bonly \d+ (left|remaining|available)\b/gi,
    /\balmost (gone|sold out)\b/gi,
    /\bselling (fast|quickly)\b/gi,
    /\bhurry\b/gi,
    /\bfast[- ]track\b/gi,
    /\bshortcut(s)?\b/gi,
    /\bcheat[- ]sheet\b/gi,
    /\bhack(s)?\b/gi,
    /\btrick(s)?\b/gi,
    /\btip(s)? and trick(s)?\b/gi,
    /\bpro[- ]tip(s)?\b/gi,
    /\blife[- ]hack(s)?\b/gi,
    /\bgrowth hack(s|ing)?\b/gi,
    /\bguru\b/gi,
    /\bexpert(s)? (reveal|share|teach)\b/gi,
    /\blearn (from|like) the (pros|experts|best)\b/gi,
    /\bmaster[- ]class\b/gi,
    /\bblueprint\b/gi,
    /\bframework\b/gi,
    /\bformula (for|to)\b/gi,
    /\bstep[- ]by[- ]step (guide|formula|system)\b/gi,
    /\bproven (system|formula|method|strategy)\b/gi,
    /\bfoolproof\b/gi,
    /\bno[- ]brainer\b/gi,
    /\bsimple (as|trick|hack|way)\b/gi,
    /\beasy (as|peasy|way|trick)\b/gi,
    /\bquick (and easy|fix|win|tip)\b/gi,
    /\bin (just )?\d+ (minutes?|hours?|days?|weeks?)\b/gi,
    /\bovernight (success|results)\b/gi,
    /\binstant (results|success|gratification)\b/gi,
    /\bimmediate (results|impact|effect)\b/gi,
    /\bwithin (minutes|hours|days)\b/gi,
    /\bas soon as (today|tomorrow|tonight)\b/gi,
    /\bright (now|away|here)\b/gi,
    /\bdon'?t (delay|hesitate|think twice)\b/gi,
    /\btake action (now|today|immediately)\b/gi,
    /\bget started (now|today|free)\b/gi,
    /\btry (it|now|today|free)\b/gi,
    /\bno (credit card|payment|commitment) (required|needed)\b/gi,
    /\bcancel anytime\b/gi,
    /\b30[- ]day (trial|guarantee|money[- ]back)\b/gi,
    /\bmoney[- ]back guarantee\b/gi,
    /\b100% (free|guaranteed|satisfaction)\b/gi,
    /\babsolutely free\b/gi,
    /\bcompletely free\b/gi,
    /\btotally free\b/gi,
    /\bno (catch|gimmick|trick)\b/gi,
    /\byou (won'?t|don'?t want to) miss (this|out)\b/gi,
    /\bsign up (now|today|free)\b/gi,
    /\bjoin (now|today|free|thousands|millions)\b/gi,
    /\b(thousands|millions|billions) of (users|customers|people)\b/gi,
    /\btrusted by (thousands|millions|Fortune 500)\b/gi,
    /\bas seen on (TV|CNN|Forbes|TechCrunch)\b/gi,
    /\bfeatured in\b/gi,
    /\baward[- ]winning\b/gi,
    /\bindustry[- ]leading\b/gi,
    /\bmarket[- ]leading\b/gi,
    /\b#1 (rated|ranked|choice)\b/gi,
    /\btop[- ]rated\b/gi,
    /\bhighest[- ]rated\b/gi,
    /\b\d+[- ]star (rating|reviews?)\b/gi,
    /\b\d+\+? ?(million|billion|thousand)?\+? (users?|customers?|downloads?)\b/gi,
    /\btransform your (life|business|career|finances)\b/gi,
    /\bchange your life\b/gi,
    /\bachieve your (dreams|goals)\b/gi,
    /\bunlock your (potential|success)\b/gi,
    /\bdiscover (how|the|your)\b/gi,
    /\blearn (how|the secret|everything)\b/gi,
    /\bfind out (how|why|what)\b/gi,
    /\bsee (how|why|what|the)\b/gi,
    /\bwatch (how|this|now)\b/gi,
    /\blook (at|what|how)\b/gi,
    /\bread (this|on|more)\b/gi,
    /\bmore (here|info|information|details)\b/gi,
    /\blearn more\b/gi,
    /\bget (more|yours|started|access)\b/gi,
    /\bfind your\b/gi,
    /\bstart your\b/gi,
    /\bbegin your\b/gi,
    /\bkickstart your\b/gi,
    /\bjumpstart your\b/gi,
    /\bboost your\b/gi,
    /\bgrow your\b/gi,
    /\bscale your\b/gi,
    /\b(double|triple|10x) your\b/gi,
    /\bincrease your .{5,30} by \d+%\b/gi
  ],

  emoji: [
    // Emoji followed by buzzwords
    /[\u{1F300}-\u{1F9FF}][\s]*Revolutioniz(e|ing)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Transform(ing|ative|ation)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Innovati(ng|on|ve)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Disrupt(ing|ive|ion)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Game[- ]changer/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Unlock(ing)? (the|your)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Navigating the/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Building (the future|tomorrow)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Leading the (way|charge)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Breaking (barriers|boundaries)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Exciting (news|announcement|times)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Proud to (announce|share|present)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Thrilled to/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Honored to/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Grateful (for|to)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Blessed to/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Humbled (by|to)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*(Big|Huge|Major) (news|announcement)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Level(ing)? up/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Next level/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Taking (it|things) to/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Raising the bar/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Pushing boundaries/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Breaking (new )?ground/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Making (waves|history|impact)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Changing the game/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Shaping the future/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Driving (change|innovation|growth)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Empowering/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Inspiring/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Amplifying/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Elevating/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Scaling/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Optimizing/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Maximizing/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Leveraging/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Harnessing/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Pioneering/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Spearheading/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Championing/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Crushing (it|goals)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Killing it/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Nailing it/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Winning/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Slaying/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Dominating/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Conquering/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Launching/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Unveiling/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Introducing/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Announcing/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Revealing/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Dropping/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Shipping/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*(New|Fresh) (chapter|journey|adventure)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Milestone (alert|achieved)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Achievement unlocked/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Success story/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Plot twist/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Hot take/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Pro tip/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Life hack/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Growth hack/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Quick win/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Game plan/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Strategy/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Framework/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Blueprint/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Roadmap/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Masterclass/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Deep dive/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Behind the scenes/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Sneak peek/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Coming soon/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Stay tuned/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Watch this space/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*More to come/giu,

    // Emoji as bullet points or separators (slop formatting)
    /\n[\u{1F300}-\u{1F9FF}][\s]*/gmu,
    /^[\u{1F300}-\u{1F9FF}][\s]*[A-Z]/gmu,
    /[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}]/giu,

    // Multiple same emojis (emphasis spam)
    /([\u{1F300}-\u{1F9FF}])\1{2,}/giu,
    /[\u{1F300}-\u{1F9FF}]{4,}/giu,

    // Multiple emojis in short span (LinkedIn slop signature)
    /[\u{1F300}-\u{1F9FF}].{0,30}[\u{1F300}-\u{1F9FF}].{0,30}[\u{1F300}-\u{1F9FF}]/giu,
    /[\u{1F300}-\u{1F9FF}].{0,50}[\u{1F300}-\u{1F9FF}]/giu,

    // Emoji at start of post/sentence (thought leader tell)
    /^[\u{1F300}-\u{1F9FF}][\s]*/gmu,
    /\.[\s]*[\u{1F300}-\u{1F9FF}][\s]*/gmu,
    /![\s]*[\u{1F300}-\u{1F9FF}][\s]*/gmu,

    // Emoji at end of sentences (punctuation replacement)
    /[\u{1F300}-\u{1F9FF}][\s]*$/gmu,
    /[\u{1F300}-\u{1F9FF}][\s]*\n/gmu,

    // Emoji surrounding text (attention grabbing)
    /[\u{1F300}-\u{1F9FF}][\s]*.{3,30}[\s]*[\u{1F300}-\u{1F9FF}]/giu,

    // Specific cringe emoji patterns
    /👇.{0,30}(link|comment|thread|below)/giu,
    /👆.{0,30}(above|check out)/giu,
    /👉.{0,30}(click|read|check|see)/giu,
    /🔥.{0,30}(hot|fire|lit|amazing)/giu,
    /💡.{0,30}(idea|tip|insight)/giu,
    /🚀.{0,30}(launch|grow|scale|rocket)/giu,
    /💪.{0,30}(strong|power|team)/giu,
    /🎯.{0,30}(target|goal|focus)/giu,
    /⚡.{0,30}(fast|quick|instant)/giu,
    /✨.{0,30}(magic|special|shine)/giu,
    /🌟.{0,30}(star|great|amazing)/giu,
    /💰.{0,30}(money|revenue|profit)/giu,
    /📈.{0,30}(growth|increase|up)/giu,
    /🎉.{0,30}(celebrate|congrat|party)/giu,
    /🎊.{0,30}(celebrate|milestone)/giu,
    /🏆.{0,30}(win|award|champion)/giu,
    /💯.{0,30}(percent|complete|perfect)/giu,
    /🔑.{0,30}(key|secret|unlock)/giu,
    /🎁.{0,30}(gift|bonus|free)/giu,
    /⏰.{0,30}(time|now|urgent|hurry)/giu,
    /🔔.{0,30}(alert|notification|reminder)/giu,
    /📣.{0,30}(announce|news|update)/giu,
    /📢.{0,30}(announce|shout|loud)/giu,
    /💬.{0,30}(comment|discuss|talk)/giu,
    /🤝.{0,30}(partner|collab|together)/giu,
    /❤️.{0,30}(love|passion|care)/giu,
    /🙏.{0,30}(thank|grateful|please)/giu,
    /👏.{0,30}(applaud|congrat|bravo)/giu,
    /🎓.{0,30}(learn|education|graduate)/giu,
    /📚.{0,30}(learn|book|knowledge)/giu,
    /🧠.{0,30}(brain|think|smart|intelligence)/giu,
    /🌍.{0,30}(world|global|international)/giu,
    /🌎.{0,30}(world|global|international)/giu,
    /🌏.{0,30}(world|global|international)/giu,

    // Emoji chains/walls (peak slop)
    /[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}]/giu,

    // Emoji at beginning and end (sandwich pattern)
    /^[\u{1F300}-\u{1F9FF}].{20,200}[\u{1F300}-\u{1F9FF}]$/gmu,

    // Call to action with emoji
    /[\u{1F300}-\u{1F9FF}][\s]*(Click|Comment|Share|Like|Follow|Subscribe|Join|Sign up|Learn more|Read more|Get|Download|Try|Start)/giu,
    /(Click|Comment|Share|Like|Follow|Subscribe|Join|Sign up|Learn more|Read more|Get|Download|Try|Start).{0,20}[\u{1F300}-\u{1F9FF}]/giu,

    // Hashtag with emoji
    /#[a-zA-Z0-9]+[\u{1F300}-\u{1F9FF}]/giu,
    /[\u{1F300}-\u{1F9FF}]#[a-zA-Z0-9]+/giu,

    // Questions with emoji
    /[\u{1F300}-\u{1F9FF}][\s]*.{5,50}\?/giu,
    /.{5,50}\?[\s]*[\u{1F300}-\u{1F9FF}]/giu,

    // Emoji in all caps context (double slop)
    /[\u{1F300}-\u{1F9FF}][\s]*[A-Z]{4,}/gmu,
    /[A-Z]{4,}[\s]*[\u{1F300}-\u{1F9FF}]/gmu,

    // Any emoji (nuclear option)
    /[\u{1F300}-\u{1F9FF}]/giu
  ]
};

const THRESHOLDS = {
  1: 15,
  2: 12,
  3: 9,
  4: 6,
  5: 4
};

// Suggestion map for common slop phrases
const SUGGESTIONS = {
  'delve into': 'Try: "explore", "examine", or just be specific about what you\'re doing',
  'navigate the landscape': 'Be specific: What actual situation or field are you referring to?',
  'paradigm shift': 'Use concrete terms: What specifically changed?',
  'game-changer': 'Explain why it matters instead of using buzzwords',
  'transformative': 'Describe the actual transformation',
  'leverage': 'Try: "use", "apply", or "take advantage of"',
  'synergy': 'Explain the actual collaboration or benefit',
  'circle back': 'Say: "follow up", "return to", or "revisit"',
  'deep dive': 'Say: "detailed analysis" or "thorough examination"',
  'unlock': 'Be specific about what becomes possible',
  'seamlessly': 'Show how it integrates instead of claiming it does',
  'robust': 'Describe the actual features or strengths',
  'comprehensive': 'List what it covers',
  'holistic': 'Explain how you\'re considering all aspects',
  'disruptive': 'Explain what it changes and how',
  'innovative': 'Describe what\'s new about it',
  'breakthrough': 'Explain what barrier was overcome',
  'revolutionary': 'Describe the actual impact',
  'amazing': 'Use specific, measurable descriptors',
  'incredible': 'Provide concrete details',
  'unprecedented': 'If true, explain what makes it unique',
  'thrilling time to be alive': 'Be specific about the advancement you\'re discussing',
  // Stop-word patterns
  'excited to announce': 'Skip the marketing fluff. Just state what you\'re announcing directly.',
  'thrilled to share': 'Get to the point. Share the actual information without the preamble.',
  'proud to announce': 'Drop the self-congratulation. Let the content speak for itself.',
  'happy to share': 'Remove this empty opener. Start with the actual content.',
  'big news': 'Don\'t hype it. If it\'s actually important, explain why.',
  'exciting news': 'Skip the editorial. Just share the information.',
  'just launched': 'State what you launched and why it matters, without the announcement fanfare.',
  'guess what': 'Don\'t make people guess. State your point directly.',
  'check out': 'Describe what it is and why it matters, don\'t just ask for engagement.',
  'can\'t wait to share': 'Then share it. Don\'t pad with artificial excitement.',
  '—': 'Em dashes are a telltale sign of AI-generated or overly dramatic content. Use simple punctuation instead.'
};

let settings = {
  sensitivity: 3,
  blockEmojis: false,
  renderMarkdown: false
};

let analysisTimeout = null;
let currentMatches = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  updateMarkdownToggle();
});

async function loadSettings() {
  try {
    // Try to load from extension storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      const stored = await chrome.storage.sync.get({
        sensitivity: 3,
        blockEmojis: false,
        renderMarkdown: false
      });
      settings = stored;
    } else {
      // Fallback to defaults if not in extension context
      settings = {
        sensitivity: 3,
        blockEmojis: false,
        renderMarkdown: false
      };
    }
  } catch (error) {
    // Fallback to defaults on error
    console.warn('Could not load settings from storage, using defaults:', error);
    settings = {
      sensitivity: 3,
      blockEmojis: false,
      renderMarkdown: false
    };
  }
}

function setupEventListeners() {
  const textInput = document.getElementById('textInput');
  const clearBtn = document.getElementById('clearBtn');
  const backBtn = document.getElementById('backBtn');
  const markdownToggle = document.getElementById('markdownToggle');
  const tooltip = document.getElementById('fixTooltip');
  const tooltipClose = tooltip?.querySelector('.tooltip-close');

  if (!textInput) {
    console.error('textInput element not found!');
    return;
  }

  // Live analysis on input (debounced)
  textInput.addEventListener('input', () => {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(() => {
      analyzeAndHighlight();
    }, 500); // 500ms debounce
  });

  // Also listen for paste events
  textInput.addEventListener('paste', () => {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(() => {
      analyzeAndHighlight();
    }, 500);
  });

  clearBtn.addEventListener('click', clearText);
  backBtn.addEventListener('click', () => window.close());

  // Markdown toggle
  markdownToggle.addEventListener('click', async () => {
    settings.renderMarkdown = !settings.renderMarkdown;

    // Save to storage if available
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        await chrome.storage.sync.set({ renderMarkdown: settings.renderMarkdown });
      }
    } catch (error) {
      console.warn('Could not save markdown setting:', error);
    }

    updateMarkdownToggle();
    analyzeAndHighlight(); // Re-render with new mode
  });

  // Tooltip close
  tooltipClose.addEventListener('click', () => {
    tooltip.style.display = 'none';
  });

  // Close tooltip on outside click
  document.addEventListener('click', (e) => {
    if (!tooltip.contains(e.target) && !e.target.classList.contains('slop-highlight')) {
      tooltip.style.display = 'none';
    }
  });
}

function updateMarkdownToggle() {
  const markdownToggle = document.getElementById('markdownToggle');
  const preview = document.getElementById('highlightedPreview');

  if (settings.renderMarkdown) {
    markdownToggle.classList.add('active');
    preview.classList.add('markdown-mode');
  } else {
    markdownToggle.classList.remove('active');
    preview.classList.remove('markdown-mode');
  }
}

function analyzeAndHighlight() {
  try {
    const text = document.getElementById('textInput').value;

    if (!text.trim()) {
      // Show placeholder
      document.getElementById('highlightedPreview').innerHTML = '<div class="placeholder-text">Your content will appear here with slop phrases highlighted...</div>';
      document.getElementById('results').style.display = 'none';
      return;
    }

    // Score the text
    const result = scoreText(text);
    currentMatches = collectAllMatches(text, result.matches);

    // Highlight in preview
    highlightText(text, currentMatches);

    // Update results
    displayResults(result);
  } catch (error) {
    console.error('Error in analyzeAndHighlight:', error);
  }
}

function scoreText(text) {
  let score = 0;
  const matches = {
    tier1: [],
    tier2: [],
    tier3: [],
    emoji: []
  };

  // Tier 1 - Always active (3 points each)
  for (const pattern of PATTERNS.tier1) {
    const found = text.match(pattern);
    if (found) {
      matches.tier1.push({ pattern: pattern.source, count: found.length, points: found.length * 3 });
      score += found.length * 3;
    }
  }

  // Tier 2 - Active at sensitivity 3+ (2 points each)
  if (settings.sensitivity >= 3) {
    for (const pattern of PATTERNS.tier2) {
      const found = text.match(pattern);
      if (found) {
        matches.tier2.push({ pattern: pattern.source, count: found.length, points: found.length * 2 });
        score += found.length * 2;
      }
    }
  }

  // Tier 3 - Active at sensitivity 4+ (1 point each)
  if (settings.sensitivity >= 4) {
    for (const pattern of PATTERNS.tier3) {
      const found = text.match(pattern);
      if (found) {
        matches.tier3.push({ pattern: pattern.source, count: found.length, points: found.length * 1 });
        score += found.length * 1;
      }
    }
  }

  // Emoji patterns if enabled (5 points each)
  if (settings.blockEmojis) {
    for (const pattern of PATTERNS.emoji) {
      const found = text.match(pattern);
      if (found) {
        matches.emoji.push({ pattern: pattern.source, count: found.length, points: found.length * 5 });
        score += found.length * 5;
      }
    }
  }

  return { score, matches };
}

function collectAllMatches(text, matches) {
  const allMatches = [];

  // Helper to add matches with position
  const addMatches = (tier, patterns) => {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          tier: tier
        });
      }
    }
  };

  // Collect all matches with positions
  addMatches('tier1', PATTERNS.tier1);
  if (settings.sensitivity >= 3) {
    addMatches('tier2', PATTERNS.tier2);
  }
  if (settings.sensitivity >= 4) {
    addMatches('tier3', PATTERNS.tier3);
  }
  if (settings.blockEmojis) {
    addMatches('emoji', PATTERNS.emoji);
  }

  // Sort by position and remove overlaps
  allMatches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep first)
  const filtered = [];
  let lastEnd = -1;
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      filtered.push(match);
      lastEnd = match.end;
    }
  }

  return filtered;
}

function highlightText(text, matches) {
  const preview = document.getElementById('highlightedPreview');

  if (matches.length === 0) {
    if (settings.renderMarkdown) {
      preview.innerHTML = renderMarkdown(text);
    } else {
      preview.textContent = text;
    }
    return;
  }

  let html;

  if (settings.renderMarkdown) {
    // For markdown mode: replace matches with placeholders, render markdown, then restore highlights
    const placeholders = [];
    let textWithPlaceholders = text;
    let offset = 0;

    // Sort matches by position
    const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

    sortedMatches.forEach((match, idx) => {
      // Use ⟪SLOP0⟫ format with Unicode angle brackets - won't be touched by markdown
      const placeholder = `⟪SLOP${idx}⟫`;
      placeholders.push({
        placeholder,
        match,
        idx
      });

      const adjustedStart = match.start + offset;
      const adjustedEnd = match.end + offset;

      textWithPlaceholders =
        textWithPlaceholders.substring(0, adjustedStart) +
        placeholder +
        textWithPlaceholders.substring(adjustedEnd);

      offset += placeholder.length - (match.end - match.start);
    });

    // Render markdown with placeholders
    html = renderMarkdown(textWithPlaceholders);

    // Replace placeholders with actual highlight spans
    placeholders.forEach(({ placeholder, match, idx }) => {
      const highlightHtml = `<span class="slop-highlight ${match.tier}" data-match-idx="${idx}">${escapeHtml(match.text)}</span>`;
      html = html.replace(new RegExp(escapeRegExp(placeholder), 'g'), highlightHtml);
    });
  } else {
    // Plain text mode: simple concatenation
    html = '';
    let lastIndex = 0;

    matches.forEach((match, idx) => {
      html += escapeHtml(text.substring(lastIndex, match.start));
      html += `<span class="slop-highlight ${match.tier}" data-match-idx="${idx}">${escapeHtml(match.text)}</span>`;
      lastIndex = match.end;
    });

    html += escapeHtml(text.substring(lastIndex));
  }

  preview.innerHTML = html;

  // Add click handlers to highlights
  preview.querySelectorAll('.slop-highlight').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-match-idx'));
      showFixTooltip(e.target, matches[idx]);
    });
  });
}

// Simple markdown renderer
function renderMarkdown(text) {
  if (!text) return '';

  let html = text;

  // Escape HTML first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (must be at start of line)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>');

  // Code blocks (```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Unordered lists
  html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul> or <ol>
  html = html.replace(/(<li>.+<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // Paragraphs (wrap text not in other tags)
  const lines = html.split('\n');
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed === '') return '';
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) return line;
    if (trimmed.match(/^<h[1-6]>/) || trimmed.match(/^<\/h[1-6]>/)) return line;
    if (trimmed.match(/^<(ul|ol|li|blockquote|pre|hr)/)) return line;
    return `<p>${line}</p>`;
  });

  html = processed.join('\n');

  return html;
}

function showFixTooltip(element, match) {
  const tooltip = document.getElementById('fixTooltip');
  const phraseEl = tooltip.querySelector('.tooltip-phrase');
  const suggestionEl = tooltip.querySelector('.tooltip-suggestion');

  // Find suggestion
  const matchLower = match.text.toLowerCase().trim();
  let suggestion = SUGGESTIONS[matchLower] || getSuggestionForTier(match.tier);

  phraseEl.textContent = `"${match.text}"`;
  suggestionEl.innerHTML = `<strong>SUGGESTION:</strong>${suggestion}`;

  // Position tooltip near the element
  const rect = element.getBoundingClientRect();
  tooltip.style.display = 'block';
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.bottom + 10}px`;

  // Adjust if goes off screen
  const tooltipRect = tooltip.getBoundingClientRect();
  if (tooltipRect.right > window.innerWidth) {
    tooltip.style.left = `${window.innerWidth - tooltipRect.width - 20}px`;
  }
  if (tooltipRect.bottom > window.innerHeight) {
    tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;
  }
}

function getSuggestionForTier(tier) {
  switch (tier) {
    case 'tier1':
      return 'This is AI-generated slop language. Be specific and authentic instead of using generic phrases.';
    case 'tier2':
      return 'This is corporate buzzword jargon. Use plain language to describe what you actually mean.';
    case 'tier3':
      return 'This is marketing spam language. Remove hype and be factual.';
    case 'emoji':
      return 'Excessive emoji usage combined with buzzwords signals low-quality content. Use emojis sparingly if at all.';
    default:
      return 'Consider rewriting this phrase to be more specific and less generic.';
  }
}

function displayResults(result) {
  const resultsSection = document.getElementById('results');
  const scoreValue = document.getElementById('scoreValue');
  const scoreStatus = document.getElementById('scoreStatus');

  resultsSection.style.display = 'block';
  scoreValue.textContent = result.score;

  // Determine status
  const threshold = THRESHOLDS[settings.sensitivity];
  let status, statusClass;

  if (result.score === 0) {
    status = '✓ CLEAN - No slop detected';
    statusClass = 'safe';
  } else if (result.score < threshold) {
    status = '⚠ BORDERLINE - Close but passes';
    statusClass = 'warning';
  } else {
    status = '✗ SLOP DETECTED - Would be blocked';
    statusClass = 'danger';
  }

  scoreValue.className = `score-value ${statusClass}`;
  scoreStatus.className = `score-status ${statusClass}`;
  scoreStatus.textContent = status;

  // Update thresholds
  updateThresholds(result.score);

  // Show breakdown
  showBreakdown(result.matches);

  // Show matches
  showMatches(result.matches);

  // Show suggestions
  showSuggestions(result.score, result.matches);
}

function updateThresholds(score) {
  for (let i = 1; i <= 5; i++) {
    const threshold = THRESHOLDS[i];
    const elem = document.getElementById(`thresh${i}`);

    if (score >= threshold) {
      elem.textContent = '✗ BLOCKED';
      elem.className = 'status-indicator block';
    } else {
      elem.textContent = '✓ PASS';
      elem.className = 'status-indicator pass';
    }
  }
}

function showBreakdown(matches) {
  const content = document.getElementById('breakdownContent');
  const tier1Score = matches.tier1.reduce((sum, m) => sum + m.points, 0);
  const tier2Score = matches.tier2.reduce((sum, m) => sum + m.points, 0);
  const tier3Score = matches.tier3.reduce((sum, m) => sum + m.points, 0);
  const emojiScore = matches.emoji.reduce((sum, m) => sum + m.points, 0);

  content.innerHTML = `
    <div class="breakdown-item">
      <span class="breakdown-tier">Tier 1 (AI Slop) - 3pts each:</span>
      <span class="breakdown-score">${tier1Score} pts</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">Tier 2 (Corporate) - 2pts each:</span>
      <span class="breakdown-score">${tier2Score} pts ${settings.sensitivity < 3 ? '(inactive)' : ''}</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">Tier 3 (Marketing) - 1pt each:</span>
      <span class="breakdown-score">${tier3Score} pts ${settings.sensitivity < 4 ? '(inactive)' : ''}</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">Emoji Slop - 5pts each:</span>
      <span class="breakdown-score">${emojiScore} pts ${!settings.blockEmojis ? '(disabled)' : ''}</span>
    </div>
  `;
}

function showMatches(matches) {
  const section = document.getElementById('matches');
  const content = document.getElementById('matchesContent');

  const allMatches = [
    ...matches.tier1,
    ...matches.tier2,
    ...matches.tier3,
    ...matches.emoji
  ];

  if (allMatches.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  content.innerHTML = allMatches.map(m => `
    <div class="match-item">
      <div class="match-pattern">${formatPattern(m.pattern)}</div>
      <div class="match-count">${m.count} match${m.count > 1 ? 'es' : ''} × ${m.points / m.count}pts = ${m.points}pts</div>
    </div>
  `).join('');
}

function showSuggestions(score, matches) {
  const content = document.getElementById('suggestionsContent');
  const suggestions = [];

  if (score === 0) {
    suggestions.push('Your content looks clean! No slop patterns detected.');
    suggestions.push('Keep writing authentic, specific content.');
  } else if (score < THRESHOLDS[settings.sensitivity]) {
    suggestions.push('Your content is borderline but would pass the filter.');
    suggestions.push('Consider removing some buzzwords to be safer.');
    suggestions.push('Click on highlighted phrases in the preview for specific suggestions.');
  } else {
    suggestions.push('Your content would be flagged as slop and blocked.');
    suggestions.push('Click on any highlighted phrase above to see how to fix it.');

    // Get top 3 actual phrases from each active tier
    const topPhrases = [];

    if (matches.tier1.length > 0) {
      const tier1Examples = getTopMatchExamples(matches.tier1, 3);
      if (tier1Examples.length > 0) {
        suggestions.push(`Remove AI-specific phrases: ${tier1Examples.join(', ')}`);
      }
    }

    if (matches.tier2.length > 0 && settings.sensitivity >= 3) {
      const tier2Examples = getTopMatchExamples(matches.tier2, 3);
      if (tier2Examples.length > 0) {
        suggestions.push(`Cut corporate buzzwords: ${tier2Examples.join(', ')}`);
      }
    }

    if (matches.tier3.length > 0 && settings.sensitivity >= 4) {
      const tier3Examples = getTopMatchExamples(matches.tier3, 3);
      if (tier3Examples.length > 0) {
        suggestions.push(`Remove marketing spam: ${tier3Examples.join(', ')}`);
      }
    }

    if (matches.emoji.length > 0 && settings.blockEmojis) {
      suggestions.push('Remove or reduce emoji usage, especially with buzzwords');
    }

    // Only add generic suggestions if we didn't get specific ones
    if (suggestions.length <= 2) {
      suggestions.push('Be more specific and less generic.');
      suggestions.push('Use concrete examples instead of abstract concepts.');
    }
  }

  content.innerHTML = suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');
}

// Helper to extract actual matched phrases from patterns
function getTopMatchExamples(tierMatches, limit) {
  const examples = [];
  const text = document.getElementById('textInput').value;

  for (const match of tierMatches.slice(0, limit)) {
    const regex = new RegExp(match.pattern, 'gi');
    const found = text.match(regex);
    if (found && found[0]) {
      // Clean up and shorten the match for display
      let example = found[0].trim();
      if (example.length > 40) {
        example = example.substring(0, 37) + '...';
      }
      examples.push(`"${example}"`);
    }
  }

  return examples;
}

function formatPattern(pattern) {
  // Clean up regex pattern for display
  let cleaned = pattern
    // Remove word boundaries
    .replace(/\\b/gi, '')
    // Remove escaped characters but keep the character
    .replace(/\\([^bsdwnu])/g, '$1')
    // Clean up character classes
    .replace(/\[\\s\]\*/g, ' ')
    .replace(/\[\\s\]/g, ' ')
    // Replace unicode ranges with readable text
    .replace(/\[\\u\{[^}]+\}-\\u\{[^}]+\}\]/gi, '[emoji]')
    .replace(/\\u\{[^}]+\}/gi, '[emoji]')
    // Replace common regex syntax
    .replace(/\{(\d+),(\d+)\}/g, '')
    .replace(/\{(\d+),\}/g, '')
    .replace(/\|/g, ' or ')
    .replace(/\.\*/g, '...')
    // Clean up remaining backslashes for common escapes
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\?/g, '?')
    .replace(/\\\'/g, "'")
    // Remove quantifiers
    .replace(/[\+\*]\?/g, '')
    // Trim and limit length
    .trim();

  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 97) + '...';
  }

  return cleaned;
}

function clearText() {
  document.getElementById('textInput').value = '';
  document.getElementById('highlightedPreview').innerHTML = '<div class="placeholder-text">Your content will appear here with slop phrases highlighted...</div>';
  document.getElementById('results').style.display = 'none';
  document.getElementById('fixTooltip').style.display = 'none';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
