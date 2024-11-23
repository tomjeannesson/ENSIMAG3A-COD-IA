# ENSIMAG3A-COD-IA

Structure du fichier json :  \<circuit\>WC --> \<genre\> F/M --> \<année\> --> \<lieu\> --> \<run\>F/F1/Q

A faire dans le terminal avant de lancer le code : source .venv/bin/activate

[Link CheatSheet Pandas](https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf)

Connexion au nash : `ssh -K <identifiant>@nash.ensimag.fr`

`srun --gres=shard:1 --cpus-per-task=8 --mam=8GB python3 <fichier.py>`

--> Doc de ensicompute


# Clustering des Athlètes

Ce projet utilise des techniques de clustering (K-Means) et de réduction de dimension (PCA) pour analyser et visualiser des données d'athlètes. Il génère des graphiques permettant d'explorer les clusters dans différentes dimensions.

## Description

### Étapes principales
1. Extraction des données depuis un fichier JSON via une classe `DataSource`.
2. Prétraitement des données et filtrage des variables pertinentes.
3. Clustering avec l'algorithme K-Means.
4. Visualisation des clusters dans :
   - L'espace des variables originales (pair plots).
   - Un espace réduit à 2 dimensions grâce à la PCA.

### Bibliothèques utilisées
- **`os`** : Gestion des dossiers.
- **`matplotlib`** : Création et sauvegarde des graphiques.
- **`seaborn`** : Visualisation avancée des données.
- **`sklearn.cluster.KMeans`** : Algorithme de clustering.
- **`sklearn.decomposition.PCA`** : Réduction de dimension.

---

## Résultats

### 1. Clustering avec 3 clusters

#### Pair Plot
Ce graphique montre les relations entre toutes les variables, avec les clusters colorés en fonction des résultats du modèle.

![Pair Plot 3 Clusters](lib/etude_clusters/multi_dimensions_cluster_3.png)

#### PCA à 2 dimensions
Les clusters sont représentés dans un espace réduit à 2 dimensions à l'aide de la PCA.

![PCA 2D 3 Clusters](lib/etude_clusters/two_dimensions_cluster_3.png)

### Analyse 

L'analyse des 3 clusters confirme une répartition logique des athlètes en fonction de leurs performances. Les clusters identifiés reflètent trois groupes bien distincts :  
- **Athlètes forts partout** : ils excellent dans tous les domaines évalués.  
- **Athlètes moyens partout** : ils obtiennent des performances équilibrées, sans exceller ni faiblir significativement.  
- **Athlètes faibles partout** : leurs scores sont globalement inférieurs sur tous les critères.  

Bien que ces observations ne révèlent rien de nouveau, elles valident que la segmentation des athlètes est cohérente avec leurs notes.

---

### 2. Clustering avec 4 clusters

L'analyse avec 3 clusters nous a permis de confirmer une répartition assez simple des athlètes, mais elle n'a pas vraiment apporté de nouvelles informations. Pour affiner l'analyse, nous avons décidé de tester avec 4 clusters. Cette segmentation plus détaillée permet de mieux capturer les différences subtiles entre les athlètes et offre une vision plus précise de leurs performances.

#### Pair Plot
Ce graphique montre les relations entre toutes les variables, avec les clusters colorés en fonction des résultats du modèle.

![Pair Plot 4 Clusters](lib/etude_clusters/multi_dimensions_cluster_4.png)

#### PCA à 2 dimensions
Les clusters sont représentés dans un espace réduit à 2 dimensions à l'aide de la PCA.

![PCA 2D 4 Clusters](lib/etude_clusters/two_dimensions_cluster_4.png)
