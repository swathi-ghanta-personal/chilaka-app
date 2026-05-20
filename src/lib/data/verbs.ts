export type Tense = 'present' | 'past' | 'future';

export interface WordForm {
	script: string;
	roman: string;
	english: string;
}

export interface Conjugation {
	pronoun: WordForm;
	verb: WordForm;
}

export interface Verb {
	id: string;
	infinitive: WordForm;
	conjugations: Record<Tense, Conjugation[]>;
	examples: Record<Tense, WordForm[]>;
}

export const TENSES: Tense[] = ['present', 'past', 'future'];

export const TENSE_LABELS: Record<Tense, string> = {
	present: 'Present',
	past: 'Past',
	future: 'Future'
};

const pronouns = {
	I: { script: 'నేను', roman: 'nēnu', english: 'I' },
	you: { script: 'నువ్వు', roman: 'nuvvu', english: 'you' },
	he: { script: 'అతను', roman: 'atanu', english: 'he' },
	she: { script: 'ఆమె', roman: 'āme', english: 'she' },
	we: { script: 'మేము', roman: 'mēmu', english: 'we' },
	youAll: { script: 'మీరు', roman: 'mīru', english: 'you (formal/plural)' },
	they: { script: 'వాళ్ళు', roman: 'vāḷḷu', english: 'they' }
} as const;

export const verbs: Verb[] = [
	{
		id: 'go',
		infinitive: { script: 'వెళ్ళు', roman: 'veḷḷu', english: 'to go' },
		conjugations: {
			present: [
				{
					pronoun: pronouns.I,
					verb: { script: 'వెళ్తున్నాను', roman: 'veḷtunnānu', english: 'I am going' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'వెళ్తున్నావు', roman: 'veḷtunnāvu', english: 'you are going' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'వెళ్తున్నాడు', roman: 'veḷtunnāḍu', english: 'he is going' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'వెళ్తోంది', roman: 'veḷtōndi', english: 'she is going' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'వెళ్తున్నాము', roman: 'veḷtunnāmu', english: 'we are going' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'వెళ్తున్నారు', roman: 'veḷtunnāru', english: 'you are going' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'వెళ్తున్నారు', roman: 'veḷtunnāru', english: 'they are going' }
				}
			],
			past: [
				{
					pronoun: pronouns.I,
					verb: { script: 'వెళ్ళాను', roman: 'veḷḷānu', english: 'I went' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'వెళ్ళావు', roman: 'veḷḷāvu', english: 'you went' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'వెళ్ళాడు', roman: 'veḷḷāḍu', english: 'he went' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'వెళ్ళింది', roman: 'veḷḷindi', english: 'she went' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'వెళ్ళాము', roman: 'veḷḷāmu', english: 'we went' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'వెళ్ళారు', roman: 'veḷḷāru', english: 'you went' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'వెళ్ళారు', roman: 'veḷḷāru', english: 'they went' }
				}
			],
			future: [
				{
					pronoun: pronouns.I,
					verb: { script: 'వెళ్తాను', roman: 'veḷtānu', english: 'I will go' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'వెళ్తావు', roman: 'veḷtāvu', english: 'you will go' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'వెళ్తాడు', roman: 'veḷtāḍu', english: 'he will go' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'వెళ్తుంది', roman: 'veḷtundi', english: 'she will go' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'వెళ్తాము', roman: 'veḷtāmu', english: 'we will go' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'వెళ్తారు', roman: 'veḷtāru', english: 'you will go' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'వెళ్తారు', roman: 'veḷtāru', english: 'they will go' }
				}
			]
		},
		examples: {
			present: [
				{
					script: 'నేను స్కూల్‌కి వెళ్తున్నాను.',
					roman: 'nēnu skūl-ki veḷtunnānu.',
					english: 'I am going to school.'
				},
				{
					script: 'ఆమె ఇంటికి వెళ్తోంది.',
					roman: 'āme iṇṭiki veḷtōndi.',
					english: 'She is going home.'
				}
			],
			past: [
				{
					script: 'మేము నిన్న పార్క్‌కి వెళ్ళాము.',
					roman: 'mēmu ninna pārk-ki veḷḷāmu.',
					english: 'We went to the park yesterday.'
				},
				{
					script: 'అతను ఇంటికి వెళ్ళాడు.',
					roman: 'atanu iṇṭiki veḷḷāḍu.',
					english: 'He went home.'
				}
			],
			future: [
				{
					script: 'రేపు నేను మార్కెట్‌కి వెళ్తాను.',
					roman: 'rēpu nēnu mārkeṭ-ki veḷtānu.',
					english: 'Tomorrow I will go to the market.'
				},
				{
					script: 'వాళ్ళు సినిమాకి వెళ్తారు.',
					roman: 'vāḷḷu sinimāki veḷtāru.',
					english: 'They will go to the movie.'
				}
			]
		}
	},
	{
		id: 'eat',
		infinitive: { script: 'తిను', roman: 'tinu', english: 'to eat' },
		conjugations: {
			present: [
				{
					pronoun: pronouns.I,
					verb: { script: 'తింటున్నాను', roman: 'tiṇṭunnānu', english: 'I am eating' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'తింటున్నావు', roman: 'tiṇṭunnāvu', english: 'you are eating' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'తింటున్నాడు', roman: 'tiṇṭunnāḍu', english: 'he is eating' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'తింటోంది', roman: 'tiṇṭōndi', english: 'she is eating' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'తింటున్నాము', roman: 'tiṇṭunnāmu', english: 'we are eating' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'తింటున్నారు', roman: 'tiṇṭunnāru', english: 'you are eating' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'తింటున్నారు', roman: 'tiṇṭunnāru', english: 'they are eating' }
				}
			],
			past: [
				{
					pronoun: pronouns.I,
					verb: { script: 'తిన్నాను', roman: 'tinnānu', english: 'I ate' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'తిన్నావు', roman: 'tinnāvu', english: 'you ate' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'తిన్నాడు', roman: 'tinnāḍu', english: 'he ate' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'తింది', roman: 'tindi', english: 'she ate' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'తిన్నాము', roman: 'tinnāmu', english: 'we ate' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'తిన్నారు', roman: 'tinnāru', english: 'you ate' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'తిన్నారు', roman: 'tinnāru', english: 'they ate' }
				}
			],
			future: [
				{
					pronoun: pronouns.I,
					verb: { script: 'తింటాను', roman: 'tiṇṭānu', english: 'I will eat' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'తింటావు', roman: 'tiṇṭāvu', english: 'you will eat' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'తింటాడు', roman: 'tiṇṭāḍu', english: 'he will eat' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'తింటుంది', roman: 'tiṇṭundi', english: 'she will eat' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'తింటాము', roman: 'tiṇṭāmu', english: 'we will eat' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'తింటారు', roman: 'tiṇṭāru', english: 'you will eat' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'తింటారు', roman: 'tiṇṭāru', english: 'they will eat' }
				}
			]
		},
		examples: {
			present: [
				{
					script: 'అతను అన్నం తింటున్నాడు.',
					roman: 'atanu annaṃ tiṇṭunnāḍu.',
					english: 'He is eating rice.'
				},
				{
					script: 'నేను పండు తింటున్నాను.',
					roman: 'nēnu paṇḍu tiṇṭunnānu.',
					english: 'I am eating a fruit.'
				}
			],
			past: [
				{
					script: 'మేము నిన్న బిర్యానీ తిన్నాము.',
					roman: 'mēmu ninna biryānī tinnāmu.',
					english: 'We ate biryani yesterday.'
				},
				{
					script: 'ఆమె కేక్ తింది.',
					roman: 'āme kēk tindi.',
					english: 'She ate cake.'
				}
			],
			future: [
				{
					script: 'వాళ్ళు రాత్రి తింటారు.',
					roman: 'vāḷḷu rātri tiṇṭāru.',
					english: 'They will eat at night.'
				},
				{
					script: 'నేను రేపు పిజ్జా తింటాను.',
					roman: 'nēnu rēpu pijjā tiṇṭānu.',
					english: 'I will eat pizza tomorrow.'
				}
			]
		}
	},
	{
		id: 'see',
		infinitive: { script: 'చూడు', roman: 'cūḍu', english: 'to see / to look' },
		conjugations: {
			present: [
				{
					pronoun: pronouns.I,
					verb: { script: 'చూస్తున్నాను', roman: 'cūstunnānu', english: 'I am seeing' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'చూస్తున్నావు', roman: 'cūstunnāvu', english: 'you are seeing' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'చూస్తున్నాడు', roman: 'cūstunnāḍu', english: 'he is seeing' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'చూస్తోంది', roman: 'cūstōndi', english: 'she is seeing' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'చూస్తున్నాము', roman: 'cūstunnāmu', english: 'we are seeing' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'చూస్తున్నారు', roman: 'cūstunnāru', english: 'you are seeing' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'చూస్తున్నారు', roman: 'cūstunnāru', english: 'they are seeing' }
				}
			],
			past: [
				{
					pronoun: pronouns.I,
					verb: { script: 'చూశాను', roman: 'cūśānu', english: 'I saw' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'చూశావు', roman: 'cūśāvu', english: 'you saw' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'చూశాడు', roman: 'cūśāḍu', english: 'he saw' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'చూసింది', roman: 'cūsindi', english: 'she saw' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'చూశాము', roman: 'cūśāmu', english: 'we saw' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'చూశారు', roman: 'cūśāru', english: 'you saw' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'చూశారు', roman: 'cūśāru', english: 'they saw' }
				}
			],
			future: [
				{
					pronoun: pronouns.I,
					verb: { script: 'చూస్తాను', roman: 'cūstānu', english: 'I will see' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'చూస్తావు', roman: 'cūstāvu', english: 'you will see' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'చూస్తాడు', roman: 'cūstāḍu', english: 'he will see' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'చూస్తుంది', roman: 'cūstundi', english: 'she will see' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'చూస్తాము', roman: 'cūstāmu', english: 'we will see' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'చూస్తారు', roman: 'cūstāru', english: 'you will see' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'చూస్తారు', roman: 'cūstāru', english: 'they will see' }
				}
			]
		},
		examples: {
			present: [
				{
					script: 'నేను సినిమా చూస్తున్నాను.',
					roman: 'nēnu sinimā cūstunnānu.',
					english: 'I am watching a movie.'
				},
				{
					script: 'అతను పుస్తకం చూస్తున్నాడు.',
					roman: 'atanu pustakaṃ cūstunnāḍu.',
					english: 'He is looking at the book.'
				}
			],
			past: [
				{
					script: 'ఆమె నిన్న ఆ చిత్రం చూసింది.',
					roman: 'āme ninna ā citraṃ cūsindi.',
					english: 'She saw that picture yesterday.'
				},
				{
					script: 'మేము ఆకాశం చూశాము.',
					roman: 'mēmu ākāśaṃ cūśāmu.',
					english: 'We looked at the sky.'
				}
			],
			future: [
				{
					script: 'రేపు మేము డాక్టర్‌ని చూస్తాము.',
					roman: 'rēpu mēmu ḍākṭar-ni cūstāmu.',
					english: 'Tomorrow we will see the doctor.'
				},
				{
					script: 'నువ్వు ఈ సినిమా చూస్తావు.',
					roman: 'nuvvu ī sinimā cūstāvu.',
					english: 'You will watch this movie.'
				}
			]
		}
	},
	{
		id: 'do',
		infinitive: { script: 'చేయి', roman: 'cēyi', english: 'to do / to make' },
		conjugations: {
			present: [
				{
					pronoun: pronouns.I,
					verb: { script: 'చేస్తున్నాను', roman: 'cēstunnānu', english: 'I am doing' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'చేస్తున్నావు', roman: 'cēstunnāvu', english: 'you are doing' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'చేస్తున్నాడు', roman: 'cēstunnāḍu', english: 'he is doing' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'చేస్తోంది', roman: 'cēstōndi', english: 'she is doing' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'చేస్తున్నాము', roman: 'cēstunnāmu', english: 'we are doing' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'చేస్తున్నారు', roman: 'cēstunnāru', english: 'you are doing' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'చేస్తున్నారు', roman: 'cēstunnāru', english: 'they are doing' }
				}
			],
			past: [
				{
					pronoun: pronouns.I,
					verb: { script: 'చేశాను', roman: 'cēśānu', english: 'I did' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'చేశావు', roman: 'cēśāvu', english: 'you did' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'చేశాడు', roman: 'cēśāḍu', english: 'he did' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'చేసింది', roman: 'cēsindi', english: 'she did' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'చేశాము', roman: 'cēśāmu', english: 'we did' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'చేశారు', roman: 'cēśāru', english: 'you did' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'చేశారు', roman: 'cēśāru', english: 'they did' }
				}
			],
			future: [
				{
					pronoun: pronouns.I,
					verb: { script: 'చేస్తాను', roman: 'cēstānu', english: 'I will do' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'చేస్తావు', roman: 'cēstāvu', english: 'you will do' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'చేస్తాడు', roman: 'cēstāḍu', english: 'he will do' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'చేస్తుంది', roman: 'cēstundi', english: 'she will do' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'చేస్తాము', roman: 'cēstāmu', english: 'we will do' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'చేస్తారు', roman: 'cēstāru', english: 'you will do' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'చేస్తారు', roman: 'cēstāru', english: 'they will do' }
				}
			]
		},
		examples: {
			present: [
				{
					script: 'అతను పని చేస్తున్నాడు.',
					roman: 'atanu pani cēstunnāḍu.',
					english: 'He is doing work.'
				},
				{
					script: 'నేను వంట చేస్తున్నాను.',
					roman: 'nēnu vaṇṭa cēstunnānu.',
					english: 'I am cooking.'
				}
			],
			past: [
				{
					script: 'మేము నిన్న పని చేశాము.',
					roman: 'mēmu ninna pani cēśāmu.',
					english: 'We did the work yesterday.'
				},
				{
					script: 'ఆమె కేక్ చేసింది.',
					roman: 'āme kēk cēsindi.',
					english: 'She made a cake.'
				}
			],
			future: [
				{
					script: 'రేపు నేను దీన్ని చేస్తాను.',
					roman: 'rēpu nēnu dīnni cēstānu.',
					english: 'Tomorrow I will do this.'
				},
				{
					script: 'వాళ్ళు ప్రయత్నం చేస్తారు.',
					roman: 'vāḷḷu prayatnaṃ cēstāru.',
					english: 'They will make an effort.'
				}
			]
		}
	},
	{
		id: 'come',
		infinitive: { script: 'రా', roman: 'rā', english: 'to come' },
		conjugations: {
			present: [
				{
					pronoun: pronouns.I,
					verb: { script: 'వస్తున్నాను', roman: 'vastunnānu', english: 'I am coming' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'వస్తున్నావు', roman: 'vastunnāvu', english: 'you are coming' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'వస్తున్నాడు', roman: 'vastunnāḍu', english: 'he is coming' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'వస్తోంది', roman: 'vastōndi', english: 'she is coming' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'వస్తున్నాము', roman: 'vastunnāmu', english: 'we are coming' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'వస్తున్నారు', roman: 'vastunnāru', english: 'you are coming' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'వస్తున్నారు', roman: 'vastunnāru', english: 'they are coming' }
				}
			],
			past: [
				{
					pronoun: pronouns.I,
					verb: { script: 'వచ్చాను', roman: 'vaccānu', english: 'I came' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'వచ్చావు', roman: 'vaccāvu', english: 'you came' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'వచ్చాడు', roman: 'vaccāḍu', english: 'he came' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'వచ్చింది', roman: 'vaccindi', english: 'she came' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'వచ్చాము', roman: 'vaccāmu', english: 'we came' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'వచ్చారు', roman: 'vaccāru', english: 'you came' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'వచ్చారు', roman: 'vaccāru', english: 'they came' }
				}
			],
			future: [
				{
					pronoun: pronouns.I,
					verb: { script: 'వస్తాను', roman: 'vastānu', english: 'I will come' }
				},
				{
					pronoun: pronouns.you,
					verb: { script: 'వస్తావు', roman: 'vastāvu', english: 'you will come' }
				},
				{
					pronoun: pronouns.he,
					verb: { script: 'వస్తాడు', roman: 'vastāḍu', english: 'he will come' }
				},
				{
					pronoun: pronouns.she,
					verb: { script: 'వస్తుంది', roman: 'vastundi', english: 'she will come' }
				},
				{
					pronoun: pronouns.we,
					verb: { script: 'వస్తాము', roman: 'vastāmu', english: 'we will come' }
				},
				{
					pronoun: pronouns.youAll,
					verb: { script: 'వస్తారు', roman: 'vastāru', english: 'you will come' }
				},
				{
					pronoun: pronouns.they,
					verb: { script: 'వస్తారు', roman: 'vastāru', english: 'they will come' }
				}
			]
		},
		examples: {
			present: [
				{
					script: 'ఆమె ఇంటికి వస్తోంది.',
					roman: 'āme iṇṭiki vastōndi.',
					english: 'She is coming home.'
				},
				{
					script: 'వాళ్ళు బస్‌లో వస్తున్నారు.',
					roman: 'vāḷḷu bas-lō vastunnāru.',
					english: 'They are coming by bus.'
				}
			],
			past: [
				{
					script: 'నువ్వు నిన్న ఇక్కడికి వచ్చావు.',
					roman: 'nuvvu ninna ikkaḍiki vaccāvu.',
					english: 'You came here yesterday.'
				},
				{
					script: 'అతను ఇంటికి వచ్చాడు.',
					roman: 'atanu iṇṭiki vaccāḍu.',
					english: 'He came home.'
				}
			],
			future: [
				{
					script: 'వాళ్ళు రేపు వస్తారు.',
					roman: 'vāḷḷu rēpu vastāru.',
					english: 'They will come tomorrow.'
				},
				{
					script: 'నేను నీతో వస్తాను.',
					roman: 'nēnu nītō vastānu.',
					english: 'I will come with you.'
				}
			]
		}
	}
];
