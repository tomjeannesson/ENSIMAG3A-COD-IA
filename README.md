*Note: tous les scripts et documents liée au traitement des données sont dans **/lib***

# Rapport projet IA

Hugo BRUCKER, Tom JEANNESON, Adame ABDELAZIZ, Julian COUX

# 1. Etude du sujet

## 1.1 La question étudiée

Nous sommes tous skieurs, dont Tom qui a été sportif de haut niveau en ski de bosses. Nous avons décidé de construire ce projet autour de cette passion commune. Tom ayant baigné dans ce sport depuis tout petit, il a pu voir les évolutions techniques utilisées par les coachs s’adapter au mieux à leurs athlètes. Les entraînements sont de plus en plus destinés à améliorer les techniques pouvant rapporter plus de points en compétition. À l’heure de l’explosion de l’intelligence artificielle, celle-ci n’est pas encore utilisée en ski de bosses et peut amener une réelle amélioration au sport. Aujourd’hui, les entraîneurs se contentent d’analyse de tableaux excel fait à la main avec des statistiques quasi inexistantes. L'apport d'outils d’analyses tel que celui-ci serait un grand plus dans le sport.
Ainsi, comment peut-on améliorer ce sport à l’aide d’outils d’IA ?

## 1.2 Les données à utiliser pour répondre à la question

Nous allons nous pencher sur un jeu de données des compétitions sur le circuit coupe du monde sur les trois dernières saisons (obtenu par Tom, dans le cadre de son PFE).

Les données ont initialement la forme suivante (elles sont contenues dans un PDF de résultats) :
![Tableau de données](lib/etude_clusters/tableau-donnees.png)
Elles sont ensuite extraites et agrégées dans des dataframes pandas.
![Données en DataFrame](lib/etude_clusters/dataframe-donnees.png)
C’est sur ces dataframes que nous allons travailler.

# 2. Travail d'extraction de donnée

## 2.1 Algorithmes d'extraction

Les premiers algorithmes d'extraction et de transformation des données sont implémentés dans le module *DataSource* ([voir ici](https://github.com/tomjeannesson/ENSIMAG3A-COD-IA/blob/main/lib/data_source.py)).  
Un des algorithmes initiaux transforme notre base de données (au format JSON, [voir ici](https://raw.githubusercontent.com/tomjeannesson/ENSIMAG3A-COD-IA/refs/heads/main/data.json)) en une structure de données exploitable : une liste de *DataFrames*. Chaque *DataFrame* représente une course et présente les informations de chaque athlète sous forme de tableau, de manière à faciliter l'analyse ultérieure :
![Données après extraction](lib/etude_clusters/extraction-donnees.png)

Afin de conserver un maximum d'informations pour une utilisation ultérieure, nous avons ajouté un attribut supplémentaire aux *DataFrames* (*dataframe.metadata*), contenant des métadonnées pour chaque course ([voir ici](https://github.com/tomjeannesson/ENSIMAG3A-COD-IA/blob/main/lib/dataframe_metadata.py)). Cet attribut enregistre des informations telles que le circuit (par exemple, World Cup "WC", European Cup "EC"), le genre (Homme "M" ou Femme "W"), l'année, le lieu et le type de course (Finale "F", Super-Finale "F1" ou Qualification "Q").

Une seconde fonction permet de filtrer les courses selon des critères spécifiques ([voir ici](https://github.com/tomjeannesson/ENSIMAG3A-COD-IA/blob/main/lib/data_source.py)). Par défaut, cette sélection s’effectue avec une structure de paramètres en tableau : `[[circuit], [genre], [année], [lieu], [type de course]]`. Par exemple, pour récupérer les *DataFrames* représentant des courses de Finale ou Super-Finale en World Cup pour les hommes en 2024, les paramètres seraient `[['WC'], ['M'], ['2024'], [], ['F', 'F1']]`.

Cette fonction intègre également un mode de filtrage permettant de définir si les paramètres doivent être inclus ou exclus, via un choix entre les modes "include" et "exclude".

En plus de ce filtrage par défaut, pour plus de flexibilité, nous avons intégré la possibilité d'appliquer un filtre personnalisé. La fonction accepte donc en paramètre une fonction de filtrage qui renvoie *True* si le *DataFrame* correspond aux critères spécifiés, permettant ainsi d’adapter les filtres aux besoins spécifiques de l'application.

Enfin, nous avons ajouté une fonction *query* qui permet d'effectuer des requêtes directement sur les *DataFrames* en utilisant la méthode *query* de Pandas, facilitant ainsi des recherches plus complexes.

## 2.2 Traitement des données

Afin de pouvoir exploiter les données agrégées dans les Dataframes évoqués ci-dessus, nous avons développé une classe nommé Extractor ([voir ici](https://github.com/tomjeannesson/ENSIMAG3A-COD-IA/blob/main/lib/extractor.py)).

Pour cette classe, on passe au constructeur une liste de Dataframes (récupérés précédemment), et nous venons les regrouper selon une dimension. Pour l’instant, nous pouvons les regrouper pour un athlète (récupérer ses statistiques globales sur l’ensemble de ces Dataframes) ou pour une compétition (récupérer les min, max et moyennes de chacun des critères de notation). Nous avons également comme ambition de faire ce même travail pour la dimension des pays.

# 3. Clustering des Athlètes

Ce projet utilise des techniques de clustering (K-Means) et de réduction de dimension (PCA) pour analyser et visualiser des données d'athlètes. Il génère des graphiques permettant d'explorer les clusters dans différentes dimensions.

## 3.1 Description

### 3.1.1 Étapes principales

1. Extraction des données depuis un fichier JSON via une classe `DataSource`.
2. Prétraitement des données et filtrage des variables pertinentes.
3. Clustering avec l'algorithme K-Means.
4. Visualisation des clusters dans :
   - L'espace des variables originales (pair plots).
   - Un espace réduit à 2 dimensions grâce à la PCA.
5. Calcul de probabilités du passage de la prochaine étape

### 3.1.2. Bibliothèques utilisées

- **`os`** : Gestion des dossiers.
- **`matplotlib`** : Création et sauvegarde des graphiques.
- **`seaborn`** : Visualisation avancée des données.
- **`sklearn.cluster.KMeans`** : Algorithme de clustering.
- **`sklearn.decomposition.PCA`** : Réduction de dimension.

---


## 3.2 Clustering avec 3 clusters

### 3.2.1 Pair Plot

Ce graphique montre les relations entre toutes les variables, avec les clusters colorés en fonction des résultats du modèle.

![Pair Plot 3 Clusters](lib/etude_clusters/multi_dimensions_cluster_3.png)

### 3.2.2 PCA à 2 dimensions

Les clusters sont représentés dans un espace réduit à 2 dimensions à l'aide de la PCA.

![PCA 2D 3 Clusters](lib/etude_clusters/two_dimensions_cluster_3.png)

### 3.2.2 Analyse

L'analyse des 3 clusters confirme une répartition logique des athlètes en fonction de leurs performances. Les clusters identifiés reflètent trois groupes bien distincts :

- **Athlètes forts partout** : ils excellent dans tous les domaines évalués.
- **Athlètes moyens partout** : ils obtiennent des performances équilibrées, sans exceller ni faiblir significativement.
- **Athlètes faibles partout** : leurs scores sont globalement inférieurs sur tous les critères.

Bien que ces observations ne révèlent rien de nouveau, elles valident que la segmentation des athlètes est cohérente avec leurs notes.

---

## 3.3 Clustering avec 4 clusters

L'analyse avec 3 clusters nous a permis de confirmer une répartition assez simple des athlètes, mais elle n'a pas vraiment apporté de nouvelles informations. Pour affiner l'analyse, nous avons décidé de tester avec 4 clusters. Cette segmentation plus détaillée permet de mieux capturer les différences subtiles entre les athlètes et offre une vision plus précise de leurs performances.

### 3.3.1 Pair Plot

Ce graphique montre les relations entre toutes les variables, avec les clusters colorés en fonction des résultats du modèle.

![Pair Plot 4 Clusters](lib/etude_clusters/multi_dimensions_cluster_4.png)

### 3.3.2 PCA à 2 dimensions

Les clusters sont représentés dans un espace réduit à 2 dimensions à l'aide de la PCA.

![PCA 2D 4 Clusters](lib/etude_clusters/two_dimensions_cluster_4.png)

### 3.3.3 Analyse

#### Analyse Pair Plot

Cette analyse avec 4 clusters s'avère bien plus pertinente que la précédente, car elle permet d'identifier des groupes de skieurs supplémentaires, offrant une compréhension plus fine des performances. On retrouve toujours un **groupe d'athlètes très performants** (excellents dans tous les domaines) et un **groupe moins performant**, mais ce sont les deux groupes intermédiaires qui rendent cette analyse particulièrement intéressante.

En examinant le graphique Pair Plot, il apparaît clairement que ces deux groupes intermédiaires diffèrent en termes de points obtenus dans certaines catégories. Voici leurs caractéristiques principales :

- **Athlètes axés sur la technique de saut :**
Ces skieurs obtiennent de bons résultats en `air_points`, reflétant une technique de saut très soignée. En revanche, leurs `time_points` sont plus faibles, ce qui indique qu'ils adoptent un rythme de descente plus lent.
- **Athlètes axés sur la vitesse :**
Ces skieurs se démarquent par d'excellents `time_points`, témoignant d'une grande rapidité. Cependant, leurs `air_points` sont plus faibles, traduisant des sauts moins techniques ou moins bien notés.

Ces deux catégories de skieurs de niveau moyen illustrent une tendance intéressante : pour atteindre un niveau intermédiaire, les athlètes semblent se spécialiser soit dans la **vitesse**, au détriment de la technique, soit dans une **meilleure exécution des sauts**, mais avec une descente plus lente. Ces observations pourraient fournir des pistes précieuses pour adapter les stratégies d'entraînement selon les profils des athlètes.

#### Analyse PCA

Ces observations sont confirmées par l’analyse en composantes principales (PCA) en 2 dimensions. Le graphique met en évidence les **trois groupes principaux** : très performants, moyens et moins performants.
Comme indiqué précédemment, le groupe des athlètes moyens se scinde en **deux sous-groupes distincts**, correspondant aux profils déjà identifiés : les skieurs axés sur la vitesse et ceux axés sur la technique de saut.

# 4. Calculs de corrélation

Avant de nous pencher sur des algorithmes de prédiction, nous avons décidé d'étudier la corrélation entre les différentes features de notre jeu de données, afin de bien comprendre comment elles interragissent entre elles.

Voici la correlation entre les six principales features du dataset.

![Corrplot](lib/etude_corrplot/corr.png)

Et voici les correlations entre toutes les features:
![Corrplot all](lib/etude_corrplot/corr-all.png)

# 5. Modèles de prédiction

## 5.1 Probabilités de qualification en finale

Pour cette partie, nous nous demandons à quel point il est possible de prédire les chances qu'a un athlète de se qualifier en finale d'une coupe du monde.
Le travail préalable consiste à s'intéresser au "breakpoints" de points d'entrée en finale et super-finale, visibles sur cette figure:
![Final breakpoints](lib/etude_ranks/plot.png)

## 5.2 Régression logistique

Pour avoir des prédictions fiables, on entraine différents modèles à l'aide d'algorithmes différents. Pour prédire ses résultats on utilise les points de notation principaux: `top_air_points`, `bottom_air_points`, `time_points`, `ski_deduction_total`, `ski_base`. Et nous voulong prédire la variable `qualified`.
Le problème a été modélisé comme un problème de classification binaire, où la variable cible est « qualifié » (1) ou « non qualifié » (0).
Concernant la régression logistique...

#### Pré-traitement des données

Pour faire d ela prédiction, il nous faut des données d'entrainement. Ce que nous avons fait, c'est comme pour les autres études, au départ simplement la récupération de tous les résultats en WorlCup des hommes. Puis on néttoie un peu les données pour garder les variables qu'on veut (cf. paragraphe d'avant).
Pour uniformiser les données, une normalisation a été appliquée à chaque colonne (valeurs transformées entre 0 et 1). La variable cible `qualified` a été créée en comparant le classement final: `result`. Si le résultat est inférieur à 16, `result = 1`, sinon `result = 0` (16 est le classement minimal pour passer en Finale).

#### Modèle Utilisé

Nous avons utilisé un modèle de régression logistique pour effectuer cette classification binaire. Ce modèle est particulièrement adapté pour ce type de problème, car il permet de calculer la probabilité qu'un athlète appartienne à une catégorie (être qualifié ou non).

Les étapes du processus sont les suivantes :

1. Division des données : Le jeu de données a été divisé en un ensemble d'entraînement (80 %) et un ensemble de test (20 %).
2. Entraînement du modèle : Le modèle a été ajusté à l'aide de l'ensemble d'entraînement.
3. Prédictions : Les prédictions ont été réalisées sur l'ensemble de test, en générant à la fois les étiquettes prédites et les probabilités associées.

Tout ceci est réalisé dans le script *etude_reg_log.py*.

#### Etude des résultats

L'évaluation du modèle a été réalisée à l'aide de plusieurs métriques :
![Final breakpoints](lib/etude_regLog/confusion_matrix.png)

Sur ce premier graphique, on peut observer les réaultats sur les prédictions et surtout, leur précision.

- **Précision** : Le modèle a atteint une précision de **~85%**, indiquant une capacité à différencier correctement les athlètes qualifiés des non qualifiés dans la majorité des cas.
En étudiant la matrice de confusion (graphique du dessus), on peut voir son taux de réussité en fonction du réaultat attendu:
- Sur **136 résultats négatifs attendus**, nous en avons obtenu **127**, ce qui nous fait seulement **9 faux positifs**.
- Sur **72 résultats positifs attedus**, nous en avons obtenu **52**, ce qui nous fait **20 faux négatifs**.

Ce qui est un résultat assez encourageant concernant la prédiction de résultat pour un athlète.
Le majorité des athlètes ne passant pas en phase finale, nous avons un plus grand de jeu de données d'entrainement pour les résultats négatifs (pas qualifié). Ce qui explique une meilleure précision.

En général, nous avons les précisions suivantes pour positif/négatif:

- **88%** : de précision pour les négatifs (prédeiction non-qualifié)
- **76%** : de précision pour les positifs (prédiction qualifié)

Ce qui est plus intéressant car on préfère dire à un athlète qu'il ne sera pas qualifié et au final il l'est (faux négatif), que l'inverse, on lui dit qu'il sera qualifié alors que non...(faux positif)

![Final breakpoints](lib/etude_regLog/courbe_roc.png)

La courbe ROC montre la performance du modèle à différents seuils de classification. Nous pouvons voir qu'avec une aire sous la courbe (AUC) de **~0.9390**, notre modèle a une très bonne capacité à distinguer les athlètes qualifiés des non qualifiés.

#### Conclusion
Le modèle de régression logistique a permis de prédire avec succès la qualification des athlètes en fonction de leurs performances. Les résultats montrent une bonne précision et des scores équilibrés pour les deux classes, ce qui confirme la pertinence des variables choisies. Cependant, certaines limites persistent, notamment le besoin de tester le modèle sur un jeu de données plus diversifié pour évaluer sa généralisation.

## 5.3 SVM

![Final breakpoints](lib/etude_svm/confusion_matrix.png)

Un **SVM** (*Support Vector Machine*, ou **machine à vecteurs de support** en français) est un algorithme d'apprentissage supervisé utilisé en **apprentissage automatique** pour résoudre des problèmes de classification et de régression. Il est particulièrement adapté pour :

- Les jeux de données de petite ou moyenne taille.
- Les problèmes où les classes sont bien séparées.

![alt text](lib/etude_svm/svm.png)

Le SVM cherche à trouver l'**hyperplan** qui sépare au mieux les données en fonction de leurs catégories (dans un problème de classification). Cet hyperplan est choisi de manière à maximiser la **marge**, c'est-à-dire la distance entre l'hyperplan et les points de données les plus proches, appelés **vecteurs de support**.

- **Hyperplan** : Une surface de séparation dans un espace multidimensionnel (par exemple, une ligne en 2D, un plan en 3D, etc.).
- **Vecteurs de support** : Les points de données les plus proches de l'hyperplan, qui influencent sa position.

## 5.4 Random Forest

Un **Random Forest** (*Forêt Aléatoire*) est un algorithme d’apprentissage supervisé combinant plusieurs arbres de décision pour améliorer la précision et la robustesse des prédictions. Il s’appuie sur deux principes clés :

1. **Bootstrap** : Chaque arbre est entraîné sur un échantillon aléatoire (tiré avec remise) des données d’entraînement.
2. **Subsampling des features** : À chaque nœud, un sous-ensemble aléatoire des *features* est utilisé pour choisir la meilleure séparation.

### 5.4.1 Principe général

1. **Création d'arbres indépendants**  
   Chaque arbre est construit en utilisant :
   - Un échantillon bootstrap des données d’entraînement.
   - Une sélection aléatoire des *features* à chaque nœud pour éviter la corrélation entre arbres.

2. **Construction récursive**  
   Les arbres sont construits récursivement en divisant les données selon le meilleur critère (basé sur le gain d'information ou l'entropie), jusqu'à ce que l’une des conditions d’arrêt soit remplie :
   - La profondeur maximale (*max_depth*) est atteinte.
   - Le nombre d’échantillons dans un nœud est inférieur à un seuil minimal (*min_samples_split*).

3. **Prédiction par vote majoritaire**  
   Pour classer un nouvel échantillon, chaque arbre effectue une prédiction. La classe finale est déterminée par un vote majoritaire des prédictions des arbres.

### 5.4.2 Implémentation

Le code implémente un Random Forest à partir de zéro. Les éléments principaux incluent :

- **Node** : Représente un nœud de l’arbre. Il stocke la *feature* utilisée pour la séparation, le *threshold* (seuil de séparation), les sous-arbres (*left*, *right*), et une valeur de prédiction si le nœud est une feuille.
- **RandomForest** : Gère l’entraînement et les prédictions de la forêt. Les étapes principales sont :
  - **Fit** : Construire plusieurs arbres en utilisant des échantillons bootstrap et des *features* sélectionnées aléatoirement.
  - **Predict** : Traverser chaque arbre pour prédire la classe d’un échantillon, puis appliquer un vote majoritaire pour la prédiction finale.

### 5.4.3 Avantages et inconvénients

- **Avantages** :
  - Robuste aux données bruitées ou non linéaires.
  - Réduit les risques de surapprentissage grâce à l’agrégation de prédictions.
  - Facilement parallélisable.

- **Inconvénients** :
  - Peut être plus lent à entraîner que d'autres modèles (comme les régressions simples).
  - Moins interprétable qu’un seul arbre de décision.

# 6. Enjeux environnementaux et sociétaux

## 6.1. Enjeux sociétaux

Le ski de bosses, bien moins médiatisé que d'autres sports, dispose de ressources limitées pour des analyses avancées. L'introduction d'un outil basé sur l'IA offrirait une aide précieuse aux entraîneurs et athlètes, en optimisant les performances et en renforçant la compétitivité, même dans des disciplines moins populaires.

Nos observations via des études Open Data montrent une relative parité hommes-femmes dans ce sport, bien que les hommes restent majoritaires. Ces données permettent de mettre en lumière des pistes pour promouvoir davantage l’inclusion et l’équité dans la discipline, contribuant à des avancées sociétales durables dans le sport de haut niveau.
![Proportion H/F](lib/etude_clusters/prop-HF.png)

## 6.2. Enjeux environnementaux

Grâce à une base de données légère, ce projet a une faible empreinte énergétique, rendant son déploiement respectueux de l’environnement. Par ailleurs, des applications futures pourraient inclure l’optimisation des infrastructures sportives ou la réduction des déplacements des équipes, participant ainsi à des pratiques sportives plus durables.

En combinant progrès technologique, équité sociétale et respect de l’environnement, ce projet démontre que performance et responsabilité peuvent aller de pair.

# 7. Bibliographie

### 7.1. Cluster

- [Clustering avec Sklearn](https://scikit-learn.org/stable/modules/clustering.html)
- [Apprentissage non-supervisé avec Python](https://www.youtube.com/watch?v=FTtzd31IAOw)

### 7.2. PCA

- [Analyse en Composantes Principales (PCA) avec Sklearn](https://scikit-learn.org/stable/modules/decomposition.html#pca)
- [Tutoriel PCA Python](https://www.datacamp.com/tutorial/principal-component-analysis-in-python)

### 7.3. Régression logistique

- [Régression logistique avec Python](https://www.datacamp.com/fr/tutorial/understanding-logistic-regression-python)
- [Régression logistique avec Scikit-learn](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression)

### 7.4. SVM

- [SVM avec Python](https://scikit-learn.org/stable/modules/svm.html)
- [SVM Tutoriel](https://www.datacamp.com/tutorial/svm-classification-scikit-learn-python)

### 7.5. Random Forest

- [Random Forest Classifier expliqué](https://towardsdatascience.com/understanding-random-forest-58381e0602d2)

### 7.6. Divers

- [Documentation Matplotlib](https://matplotlib.org/stable/index.html)
- [Numpy Guide](https://numpy.org/doc/stable/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
