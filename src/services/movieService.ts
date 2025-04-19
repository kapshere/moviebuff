
// Since external APIs are having issues, we'll create a mock movie database
// with a good selection of movies per genre

export interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  overview: string;
}

export interface Genre {
  id: number;
  name: string;
}

// Create a large mock movie database with realistic data
const mockMovieDatabase: Record<number, Movie[]> = {
  // Action Movies (ID: 28)
  28: [
    {
      id: 1001,
      title: "Die Hard",
      release_date: "1988-07-15",
      poster_path: "https://m.media-amazon.com/images/M/MV5BZjRlNDUxZjAtOGQ4OC00OTNlLTgxNmQtYTBmMDgwZmNmNjkxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      vote_average: 8.2,
      overview: "An NYPD officer tries to save his wife and several others taken hostage by German terrorists during a Christmas party at the Nakatomi Plaza in Los Angeles."
    },
    {
      id: 1002,
      title: "Mad Max: Fury Road",
      release_date: "2015-05-15",
      poster_path: "https://m.media-amazon.com/images/M/MV5BN2EwM2I5OWMtMGQyMi00Zjg1LWJkNTctZTdjYTA4OGUwZjMyXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      vote_average: 8.1,
      overview: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max."
    },
    {
      id: 1003,
      title: "John Wick",
      release_date: "2014-10-24",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_.jpg",
      vote_average: 7.4,
      overview: "An ex-hit-man comes out of retirement to track down the gangsters that killed his dog and took everything from him."
    },
    {
      id: 1004,
      title: "The Matrix",
      release_date: "1999-03-31",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      vote_average: 8.7,
      overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
    },
    {
      id: 1005,
      title: "Avengers: Endgame",
      release_date: "2019-04-26",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg",
      vote_average: 8.4,
      overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe."
    },
    {
      id: 1006,
      title: "Terminator 2: Judgment Day",
      release_date: "1991-07-03",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMGU2NzRmZjUtOGUxYS00ZjdjLWEwZWItY2NlM2JhNjkxNTFmXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      vote_average: 8.5,
      overview: "A cyborg, identical to the one who failed to kill Sarah Connor, must now protect her teenage son, John Connor, from a more advanced and powerful cyborg."
    }
  ],
  
  // Comedy Movies (ID: 35)
  35: [
    {
      id: 2001,
      title: "Superbad",
      release_date: "2007-08-17",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTc0NjIyMjA2OF5BMl5BanBnXkFtZTcwMzIxNDE1MQ@@._V1_.jpg",
      vote_average: 7.6,
      overview: "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry."
    },
    {
      id: 2002,
      title: "The Hangover",
      release_date: "2009-06-05",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNGQwZjg5YmYtY2VkNC00NzliLTljYTctNzI5NmU3MjE2ODQzXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      vote_average: 7.7,
      overview: "Three buddies wake up from a bachelor party in Las Vegas, with no memory of the previous night and the bachelor missing. They make their way around the city in order to find their friend before his wedding."
    },
    {
      id: 2003,
      title: "Bridesmaids",
      release_date: "2011-05-13",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjAyOTMyMzUxNl5BMl5BanBnXkFtZTcwODI4MzE0NA@@._V1_.jpg",
      vote_average: 6.8,
      overview: "Competition between the maid of honor and a bridesmaid, over who is the bride's best friend, threatens to upend the life of an out-of-work pastry chef."
    },
    {
      id: 2004,
      title: "Step Brothers",
      release_date: "2008-07-25",
      poster_path: "https://m.media-amazon.com/images/M/MV5BODViZDg3ZjYtMzhiYS00YTVkLTk4MzktYWUxMTlkYjc1NjdlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      vote_average: 6.9,
      overview: "Two aimless middle-aged losers still living at home are forced against their will to become roommates when their parents marry."
    },
    {
      id: 2005,
      title: "Dumb and Dumber",
      release_date: "1994-12-16",
      poster_path: "https://m.media-amazon.com/images/M/MV5BZDQwMjNiMTQtY2UwYy00NjhiLTk0ZWEtZWM5ZWMzNGFjNTVkXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      vote_average: 7.3,
      overview: "After a woman leaves a briefcase at the airport terminal, a dumb limo driver and his dumber friend set out on a hilarious cross-country road trip to Aspen to return it."
    },
    {
      id: 2006,
      title: "Anchorman: The Legend of Ron Burgundy",
      release_date: "2004-07-09",
      poster_path: "https://m.media-amazon.com/images/M/MV5BODI4NDY2NDM5M15BMl5BanBnXkFtZTgwNzEwOTMxMDE@._V1_.jpg",
      vote_average: 7.2,
      overview: "Ron Burgundy is San Diego's top-rated newsman in the male-dominated broadcasting of the 1970s, but that's all about to change when an ambitious woman is hired as a new anchor."
    }
  ],
  
  // Drama Movies (ID: 18)
  18: [
    {
      id: 3001,
      title: "The Shawshank Redemption",
      release_date: "1994-09-23",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
      vote_average: 9.3,
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
    },
    {
      id: 3002,
      title: "The Godfather",
      release_date: "1972-03-24",
      poster_path: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      vote_average: 9.2,
      overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
    },
    {
      id: 3003,
      title: "Forrest Gump",
      release_date: "1994-07-06",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      vote_average: 8.8,
      overview: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart."
    },
    {
      id: 3004,
      title: "Schindler's List",
      release_date: "1993-12-15",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      vote_average: 8.9,
      overview: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis."
    },
    {
      id: 3005,
      title: "The Green Mile",
      release_date: "1999-12-10",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_.jpg",
      vote_average: 8.6,
      overview: "The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift."
    }
  ],

  // Horror Movies (ID: 27)
  27: [
    {
      id: 4001,
      title: "The Shining",
      release_date: "1980-05-23",
      poster_path: "https://m.media-amazon.com/images/M/MV5BZWFlYmY2MGEtZjVkYS00YzU4LTg0YjQtYzY1ZGE3NTA5NGQxXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      vote_average: 8.4,
      overview: "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence, while his psychic son sees horrific forebodings from both past and future."
    },
    {
      id: 4002,
      title: "The Exorcist",
      release_date: "1973-12-26",
      poster_path: "https://m.media-amazon.com/images/M/MV5BYjhmMGMzZDYtMTkyNy00YWVmLTgyYmUtYTU3ZjcwNTBjN2I1XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      vote_average: 8.0,
      overview: "When a 12-year-old girl is possessed by a mysterious entity, her mother seeks the help of two priests to save her."
    },
    {
      id: 4003,
      title: "Hereditary",
      release_date: "2018-06-08",
      poster_path: "https://m.media-amazon.com/images/M/MV5BOTU5MDg3OGItZWQ1Ny00ZGVmLTg2YTUtMzBkYzQ1YWIwZjlhXkEyXkFqcGdeQXVyNTAzMTY4MDA@._V1_.jpg",
      vote_average: 7.3,
      overview: "A grieving family is haunted by tragic and disturbing occurrences after the death of their secretive grandmother."
    },
    {
      id: 4004,
      title: "Get Out",
      release_date: "2017-02-24",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc0MTI@._V1_.jpg",
      vote_average: 7.7,
      overview: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point."
    },
    {
      id: 4005,
      title: "A Quiet Place",
      release_date: "2018-04-06",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjI0MDMzNTQ0M15BMl5BanBnXkFtZTgwMTM5NzM3NDM@._V1_.jpg",
      vote_average: 7.5,
      overview: "In a post-apocalyptic world, a family is forced to live in silence while hiding from monsters with ultra-sensitive hearing."
    }
  ],

  // Thriller Movies (ID: 53)
  53: [
    {
      id: 5001,
      title: "The Silence of the Lambs",
      release_date: "1991-02-14",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      vote_average: 8.6,
      overview: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims."
    },
    {
      id: 5002,
      title: "Se7en",
      release_date: "1995-09-22",
      poster_path: "https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjczMi00OTk4LTg3NWUtNmVhMTAzNTNjYjcyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      vote_average: 8.6,
      overview: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives."
    },
    {
      id: 5003,
      title: "Prisoners",
      release_date: "2013-09-20",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTg0NTIzMjQ1NV5BMl5BanBnXkFtZTcwNDc3MzM5OQ@@._V1_.jpg",
      vote_average: 8.1,
      overview: "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads and the pressure mounts."
    },
    {
      id: 5004,
      title: "Gone Girl",
      release_date: "2014-10-03",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTk0MDQ3MzAzOV5BMl5BanBnXkFtZTgwNzU1NzE3MjE@._V1_.jpg",
      vote_average: 8.1,
      overview: "With his wife's disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him when it's suspected that he may not be innocent."
    },
    {
      id: 5005,
      title: "Parasite",
      release_date: "2019-10-11",
      poster_path: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg",
      vote_average: 8.6,
      overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
    }
  ],

  // Romance Movies (ID: 10749)
  10749: [
    {
      id: 6001,
      title: "The Notebook",
      release_date: "2004-06-25",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTk3OTM5Njg5M15BMl5BanBnXkFtZTYwMzA0ODI3._V1_.jpg",
      vote_average: 7.8,
      overview: "A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social differences."
    },
    {
      id: 6002,
      title: "Pride & Prejudice",
      release_date: "2005-11-11",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTA1NDQ3NTcyOTNeQTJeQWpwZ15BbWU3MDA0MzA4MzE@._V1_.jpg",
      vote_average: 7.8,
      overview: "Sparks fly when spirited Elizabeth Bennet meets single, rich, and proud Mr. Darcy. But Mr. Darcy reluctantly finds himself falling in love with a woman beneath his class."
    },
    {
      id: 6003,
      title: "La La Land",
      release_date: "2016-12-09",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_.jpg",
      vote_average: 8.0,
      overview: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future."
    },
    {
      id: 6004,
      title: "Eternal Sunshine of the Spotless Mind",
      release_date: "2004-03-19",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTY4NzcwODg3Nl5BMl5BanBnXkFtZTcwNTEwOTMyMw@@._V1_.jpg",
      vote_average: 8.3,
      overview: "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories."
    },
    {
      id: 6005,
      title: "Before Sunrise",
      release_date: "1995-01-27",
      poster_path: "https://m.media-amazon.com/images/M/MV5BZDdiZTAwYzAtMDI3Ni00OTRjLTkzN2UtMGE3MDMyZmU4NTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      vote_average: 8.1,
      overview: "A young man and woman meet on a train in Europe, and wind up spending one evening together in Vienna. Unfortunately, both know that this will probably be their only night together."
    }
  ],

  // Science Fiction Movies (ID: 878)
  878: [
    {
      id: 7001,
      title: "Blade Runner 2049",
      release_date: "2017-10-06",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_.jpg",
      vote_average: 8.0,
      overview: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years."
    },
    {
      id: 7002,
      title: "Interstellar",
      release_date: "2014-11-07",
      poster_path: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      vote_average: 8.6,
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    },
    {
      id: 7003,
      title: "Inception",
      release_date: "2010-07-16",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
      vote_average: 8.8,
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    },
    {
      id: 7004,
      title: "Arrival",
      release_date: "2016-11-11",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_.jpg",
      vote_average: 7.9,
      overview: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world."
    },
    {
      id: 7005,
      title: "The Martian",
      release_date: "2015-10-02",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTc2MTQ3MDA1Nl5BMl5BanBnXkFtZTgwODA3OTI4NjE@._V1_.jpg",
      vote_average: 8.0,
      overview: "An astronaut becomes stranded on Mars after his team assume him dead, and must rely on his ingenuity to find a way to signal to Earth that he is alive."
    }
  ],

  // Family Movies (ID: 10751)
  10751: [
    {
      id: 8001,
      title: "Toy Story",
      release_date: "1995-11-22",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMDU2ZWJlMjktMTRhMy00ZTA5LWEzNDgtYmNmZTEwZTViZWJkXkEyXkFqcGdeQXVyNDQ2OTk4MzI@._V1_.jpg",
      vote_average: 8.3,
      overview: "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room."
    },
    {
      id: 8002,
      title: "Finding Nemo",
      release_date: "2003-05-30",
      poster_path: "https://m.media-amazon.com/images/M/MV5BZTAzNWZlNmUtZDEzYi00ZjA5LWIwYjEtZGM1NWE1MjE4YWRhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      vote_average: 8.1,
      overview: "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home."
    },
    {
      id: 8003,
      title: "Up",
      release_date: "2009-05-29",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTk3NDE2NzI4NF5BMl5BanBnXkFtZTgwNzE1MzEyMTE@._V1_.jpg",
      vote_average: 8.2,
      overview: "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, inadvertently taking a young stowaway."
    },
    {
      id: 8004,
      title: "The Lion King",
      release_date: "1994-06-24",
      poster_path: "https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_.jpg",
      vote_average: 8.5,
      overview: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself."
    },
    {
      id: 8005,
      title: "Inside Out",
      release_date: "2015-06-19",
      poster_path: "https://m.media-amazon.com/images/M/MV5BOTgxMDQwMDk0OF5BMl5BanBnXkFtZTgwNjU5OTg2NDE@._V1_.jpg",
      vote_average: 8.2,
      overview: "After young Riley is uprooted from her Midwest life and moved to San Francisco, her emotions - Joy, Fear, Anger, Disgust and Sadness - conflict on how best to navigate a new city, house, and school."
    }
  ],

  // Adventure Movies (ID: 12)
  12: [
    {
      id: 9001,
      title: "The Lord of the Rings: The Fellowship of the Ring",
      release_date: "2001-12-19",
      poster_path: "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg",
      vote_average: 8.8,
      overview: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron."
    },
    {
      id: 9002,
      title: "Raiders of the Lost Ark",
      release_date: "1981-06-12",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjA0ODEzMTc1Nl5BMl5BanBnXkFtZTcwODM2MjAxNA@@._V1_.jpg",
      vote_average: 8.4,
      overview: "In 1936, archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant before the Nazis can obtain its awesome powers."
    },
    {
      id: 9003,
      title: "Jurassic Park",
      release_date: "1993-06-11",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_.jpg",
      vote_average: 8.1,
      overview: "A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting a couple of kids after a power failure causes the park's cloned dinosaurs to run loose."
    },
    {
      id: 9004,
      title: "The Princess Bride",
      release_date: "1987-09-25",
      poster_path: "https://m.media-amazon.com/images/M/MV5BYzdiOTVjZmQtNjAyNy00YjA2LTk5ZTAtNmJkMGQ5N2RmNjUxXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg",
      vote_average: 8.0,
      overview: "While home sick in bed, a young boy's grandfather reads him the story of a farmboy-turned-pirate who encounters numerous obstacles, enemies and allies in his quest to be reunited with his true love."
    },
    {
      id: 9005,
      title: "The Revenant",
      release_date: "2015-12-25",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMDE5OWMzM2QtOTU2ZS00NzAyLWI2MDEtOTRlYjIxZGM0OWRjXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
      vote_average: 8.0,
      overview: "A frontiersman on a fur trading expedition in the 1820s fights for survival after being mauled by a bear and left for dead by members of his own hunting team."
    }
  ],

  // Animation Movies (ID: 16)
  16: [
    {
      id: 10001,
      title: "Spider-Man: Into the Spider-Verse",
      release_date: "2018-12-14",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgzOF5BMl5BanBnXkFtZTgwNTkwNTQ3NjM@._V1_.jpg",
      vote_average: 8.4,
      overview: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities."
    },
    {
      id: 10002,
      title: "Spirited Away",
      release_date: "2001-07-20",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      vote_average: 8.6,
      overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts."
    },
    {
      id: 10003,
      title: "Your Name",
      release_date: "2016-08-26",
      poster_path: "https://m.media-amazon.com/images/M/MV5BODRmZDVmNzUtZDA4ZC00NjhkLWI2M2UtN2M0ZDIzNDcxYThjL2ltYWdlXkEyXkFqcGdeQXVyNTk0MzMzODA@._V1_.jpg",
      vote_average: 8.4,
      overview: "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?"
    },
    {
      id: 10004,
      title: "Wall-E",
      release_date: "2008-06-27",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjExMTg5OTU0NF5BMl5BanBnXkFtZTcwMjMxMzMzMw@@._V1_.jpg",
      vote_average: 8.4,
      overview: "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind."
    },
    {
      id: 10005,
      title: "Coco",
      release_date: "2017-11-22",
      poster_path: "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_.jpg",
      vote_average: 8.4,
      overview: "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer."
    }
  ]
};

// List of available genres
export const getGenres = async (): Promise<Genre[]> => {
  // Static genres list since we're using mock data
  return [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' },
    { id: 53, name: 'Thriller' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10751, name: 'Family' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' }
  ];
};

// Get movies by genre ID
export const getMoviesByGenre = async (genreId: number): Promise<Movie[]> => {
  // Get movies from our mock database
  return mockMovieDatabase[genreId] || [];
};

// Get similar movies (movies from random genres)
export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  // Find the movie's genre by looking through all genres
  let movieGenre = null;
  for (const [genreId, movies] of Object.entries(mockMovieDatabase)) {
    const found = movies.find(m => m.id === movieId);
    if (found) {
      movieGenre = parseInt(genreId);
      break;
    }
  }

  if (movieGenre) {
    // Return other movies from the same genre, excluding the selected one
    return mockMovieDatabase[movieGenre].filter(m => m.id !== movieId);
  }
  
  // If we can't find the movie's genre, return random movies
  const allGenreIds = Object.keys(mockMovieDatabase).map(id => parseInt(id));
  const randomGenreId = allGenreIds[Math.floor(Math.random() * allGenreIds.length)];
  return mockMovieDatabase[randomGenreId];
};

// Fallback data in case something goes wrong
export const getFallbackMovies = (genre: string): Movie[] => {
  // Find the genre ID from the name
  const genres = [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' },
    { id: 53, name: 'Thriller' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10751, name: 'Family' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' }
  ];
  
  const genreObj = genres.find(g => g.name === genre);
  if (genreObj && mockMovieDatabase[genreObj.id]) {
    return mockMovieDatabase[genreObj.id];
  }
  
  // Default fallback if we can't match the genre
  return [
    {
      id: 1,
      title: `Sample ${genre} Movie 1`,
      release_date: '2023-01-01',
      poster_path: '/placeholder.svg',
      vote_average: 8.5,
      overview: 'This is a placeholder movie when the API is unavailable.'
    },
    {
      id: 2,
      title: `Sample ${genre} Movie 2`,
      release_date: '2023-02-15',
      poster_path: '/placeholder.svg',
      vote_average: 7.8,
      overview: 'Another placeholder movie for demonstration purposes.'
    },
    {
      id: 3,
      title: `Sample ${genre} Movie 3`,
      release_date: '2023-03-20',
      poster_path: '/placeholder.svg',
      vote_average: 9.0,
      overview: 'A third placeholder movie to show when the API is down.'
    }
  ];
};
