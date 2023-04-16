class Rules {
  rules: string[] = [];
  addRole(rule: string) {
    this.rules.push(rule);
  }

  getRoles() {
    return this.rules.join("\n");
  }
}
const ruleInstance = new Rules();
ruleInstance.addRole(
  "as a blog editor Rewrite content for blog post using blog input and follow below conditions."
);
ruleInstance.addRole(`our output should be like with html tags in the body for SEO purpose in json format
{
  "title": "the new content title ",
  "category": "the new category",
  "tags": "the new tags",
  "body": "the new rewritten content " // min 500 word, separate paragraphs with html <p> tag, no empty space between paragraphs
}`);
ruleInstance.addRole(
  "include source of the news in new content we got this content in new content body at to the content  of content use content_source and content_source_url "
);
ruleInstance.addRole("Do not include source name in the title");
ruleInstance.addRole(`follow this json template to understand fields.
{
  "feed_title": "This field is the rss feed title",
  "feed_link": "this field is for feed link that our crawler will follow to scrape its content",
  "feed_description": "this field is rss feed description which in most of the case is trimmed ",
  "crawl": { // this object for crawler which generated after our crawler visited the target
    "content_source": "this is the rss feed source in most of the case a website or company name",
    "content_source_url": "this is the source address that our crawler reached after following feed_link",
    "content_meta_title": "this is the target page meta title which crawled by our crawler  ",
    "content__meta_description": "this is the target page meta description which crawled by our crawler just like feed_description it may be trimmed",
    "content_image": "this is target website image meta tag",
    "content_keyword": "this is keyword meta tag of target",
    "content_text": "this is all paragraphs that founded by our crawler from target website which is related to feed_* and content_*. this is our main source of content",
  },
}`);
ruleInstance.addRole("do not include crawl* in the content");
ruleInstance.addRole(
  "include at least 2 external link to scientific sources related to this content. make it within article should seems natural "
);
ruleInstance.addRole(`original content input:
{
  "feed_title": "Bird Flu Sample from Chilean Man Showed Some Signs of Adaptation to Mammals - The New York Times",
  "feed_link": "https://news.google.com/rss/articles/CBMiP2h0dHBzOi8vd3d3Lm55dGltZXMuY29tLzIwMjMvMDQvMTQvc2NpZW5jZS9iaXJkLWZsdS1odW1hbnMuaHRtbNIBAA?oc=5",
  "feed_description": "Bird Flu Sample from Chilean Man Showed Some Signs of Adaptation to Mammals&nbsp;&nbsp;The New York TimesBird flu: Scientists find mutations, say threat is still low&nbsp;&nbsp;ABC NewsHere's how many birds...",
  "published": "Sat Apr 15 2023 01:00:25 GMT+0200 (Central European Summer Time)",
  "crawl": {
    "original_content_source": "nytimes",
    "original_content_source_url": "https://www.nytimes.com/2023/04/14/science/bird-flu-humans.html",
    "original_content_meta_title": "Bird Flu Sample from Chilean Man Showed Some Signs of Adaptation to Mammals - The New York Times",
    "original_content__meta_description": "These changes were unlikely to be enough to allow the virus to spread easily among humans, and the health risk to the public remains low, experts said.",
    "original_content_image": "https://static01.nyt.com/images/2023/04/14/multimedia/14BIRD-FLU-pqcf/14BIRD-FLU-pqcf-facebookJumbo.jpg",
    "original_content_keyword": null,
    "original_content_text": "AdvertisementSupported byThese changes were unlikely to be enough to allow the virus to spread easily among humans, and the health risk to the public remains low, experts said.Send any friend a storyAs a subscriber, you have 10 gift articles to give each month. Anyone can read what you share.By Emily AnthesA sample of avian influenza isolated from a Chilean man who fell ill last month contains two genetic mutations that are signs of adaptation to mammals, officials from the Centers for Disease Control and Prevention said on Friday. In experimental animal studies, the mutations, both of which are in what is known as the PB2 gene, have previously been shown to help the virus replicate better in mammalian cells.The risk to the public remains low, health officials said, and no additional human cases have been linked to the Chilean man, who remains hospitalized.Moreover, the sample was missing other critical genetic changes that scientists believe would be necessary for the virus, known as H5N1, to spread efficiently among humans, including mutations that would stabilize the virus and help it bind more tightly to human cells.“There are three major categories of changes we think H5 has to undergo to switch from being a bird virus to being a human virus,” said Richard J. Webby, a bird flu expert at St. Jude Children’s Research Hospital. “The sequences from the person in Chile have one of those classes of changes. But we also know that of those three sets of changes, this is the easiest one for the virus to make.”PB2 mutations have been found in other mammals infected with this version of the virus, as well as in some people infected with other versions of H5N1. The mutations most likely emerged in the Chilean patient over the course of his infection, experts said.The spread of H5N1. A new variant of this strain of the avian flu has spread widely through bird populations in recent years. It has taken an unusually heavy toll on wild birds and repeatedly spilled over into mammals, including minks, foxes and bears. Here’s what to know about the virus:What is avian influenza? Better known as the bird flu, avian influenza is a group of flu viruses that is well adapted to birds. Some strains, like the version of H5N1 that is currently spreading, are frequently fatal to chickens and turkeys. It spreads via nasal secretions, saliva and fecal droppings, which experts say makes it difficult to contain.Should humans be worried about being infected? Although the danger to the public is currently low, people who are in close contact with sick birds can and have been infected. The virus is primarily a threat to birds, but infections in mammals increase the odds that the virus could mutate in ways that make it more of a risk to humans, experts say.How can we stop the spread? The U.S. Department of Agriculture has urged poultry growers to tighten their farms’ biosecurity measures, which includes preventing contact between wild birds and domestic animals. But the virus is so contagious that there is little choice but to cull infected flocks, experts say.Is it safe to eat poultry and eggs? The Agriculture Department has said that properly prepared and cooked poultry and eggs should not pose a risk to consumers. The chance of infected poultry entering the food chain is “extremely low,” according to the agency.Can I expect to pay more for poultry products? Egg prices soared when an outbreak ravaged the United States in 2014 and 2015. The current outbreak of the virus — paired with inflation and other factors — is contributing to an egg supply shortage and record-high prices in some parts of the country.“We understand them to be a step on the path to adaptation to humans and increased risk to humans,” said Anice C. Lowen, an influenza virologist at Emory University. “So certainly it’s concerning to see them.”But these mutations alone are probably not sufficient to produce a virus that spreads easily among humans, she added.“Those genetic changes have been seen previously with past H5N1 infections, and have not resulted in spread between people,” Vivien Dugan, acting director of the influenza division at the C.D.C.’s National Center for Immunization and Respiratory Diseases, said in a statement.“Nevertheless, it’s important to continue to look carefully at every instance of human infection, as well as other mammalian spillover events, and to track viral evolution in birds,” Dr. Dugan said. “We need to remain vigilant for changes that would make these viruses more dangerous to people.”The sample was sequenced by the National Influenza Center in Chile and uploaded to GISAID, an international database of viral genomes, overnight, C.D.C. officials said.Chile’s Ministry of Health reported the case to the World Health Organization on March 29. The patient, a 53-year-old man, developed respiratory symptoms, including a cough and a sore throat, and was hospitalized when his condition deteriorated, according to the W.H.O.Investigation into the case is continuing, and how the man became infected remains unclear. But the virus had recently been detected in birds and sea lions in the region where the man lives.“According to the preliminary findings of the local epidemiological investigation, the most plausible hypothesis about transmission is that it occurred through environmental exposure to areas where either sick or dead birds or sea mammals were found close to the residence of the case,” the W.H.O. reported last week.It is the 11th reported human case of H5N1 since January 2022, according to the C.D.C., none of which have been associated with human-to-human transmission. Since H5N1 was first detected in birds in 1996, there have been hundreds of human infections globally, mostly in people who were in close contact with birds.Still, experts have long been worried about the possibility that avian influenza, which is well adapted to birds, might evolve to spread more easily among humans, potentially setting off another pandemic. An H5N1 outbreak on a Spanish mink farm last fall suggests that the virus is capable of adapting to spread more efficiently among at least some mammals. And every human infection gives the virus more opportunities to adapt.The mutations documented in the Chilean patient are a “step in the wrong direction,” Dr. Lowen said.This version of the virus has spread rapidly through wild birds in the Americas, sparking regular outbreaks in farmed poultry. The virus has become so widespread in birds that it has repeatedly spilled over into mammals, and “continued sporadic human infections are anticipated,” the C.D.C. wrote in a recent technical report.Advertisement",
  }
}`);
export default ruleInstance;
