import React, { useState, useEffect } from 'react';

const Scan973App = () => {
  // États d'authentification et navigation
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('accueil');
  const [searchTerm, setSearchTerm] = useState('');
  const [suiviProduits, setSuiviProduits] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedPanier, setSelectedPanier] = useState('famille');
  const [user, setUser] = useState({ 
    premium: false, 
    points: 42, 
    economiesMensuelle: 23.40,
    objectifMensuel: 30,
    badge: "Défenseur du pouvoir d'achat",
    niveau: 1,
    prixAjoutes: 23,
    personnesAidees: 156
  });
  
  const [scannerActive, setScannerActive] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    categorie: '',
    article: '',
    marque: '',
    conditionnement: '',
    prix: '',
    magasin: ''
  });
  const [searchProduct, setSearchProduct] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState(null);

  // Fonctions de persistance et d'authentification
  useEffect(() => {
    // Charger les données au démarrage
    const savedUser = localStorage.getItem('prixkote_user');
    const savedCurrentUser = localStorage.getItem('prixkote_current_user');
    const savedProduits = localStorage.getItem('prixkote_produits');
    const savedAuth = localStorage.getItem('prixkote_authenticated');
    
    if (savedCurrentUser && savedAuth === 'true') {
      setCurrentUser(JSON.parse(savedCurrentUser));
      setIsAuthenticated(true);
      setShowWelcome(false);
    }
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedProduits) {
      setProduits(JSON.parse(savedProduits));
    }
  }, []);

  // Sauvegarder les données utilisateur
  useEffect(() => {
    if (user) {
      localStorage.setItem('prixkote_user', JSON.stringify(user));
    }
  }, [user]);

  // Sauvegarder les données d'authentification
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('prixkote_current_user', JSON.stringify(currentUser));
      localStorage.setItem('prixkote_authenticated', 'true');
    }
  }, [currentUser]);

  // Fonction de connexion/inscription
  const handleAuth = (userData) => {
    const newUser = {
      id: Date.now(),
      pseudo: userData.pseudo,
      email: userData.email || '',
      dateInscription: new Date().toLocaleDateString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.pseudo}`
    };
    
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setShowWelcome(false);
    
    // Mettre à jour les points avec le nom
    setUser(prevUser => ({
      ...prevUser,
      pseudo: userData.pseudo,
      points: prevUser.points + 50 // Bonus d'inscription
    }));
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('prixkote_current_user');
    localStorage.removeItem('prixkote_authenticated');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowWelcome(true);
  };

  // Base de reconnaissance intelligente des produits
  const [reconnaissanceProduits] = useState({
    // Produits laitiers (différents formats)
    "lait": { categorie: "Produits laitiers", article: "Lait", conditionnement: "1L", mots: ["lait", "lactel", "candia"], quantiteAuto: 1 },
    "lait pack": { categorie: "Produits laitiers", article: "Lait", conditionnement: "Pack 6x1L", mots: ["pack lait", "6 briques lait", "pack lactel", "pack 6 lait", "6x lait"], quantiteAuto: 1 },
    "lait demi-litre": { categorie: "Produits laitiers", article: "Lait", conditionnement: "50cl", mots: ["petit lait", "lait 50cl", "demi-litre"], quantiteAuto: 2 },
    "yaourt": { categorie: "Produits laitiers", article: "Yaourt", conditionnement: "Nature 4x125g", mots: ["yaourt", "yogurt", "danone", "activia"], quantiteAuto: 1 },
    "yaourt pack": { categorie: "Produits laitiers", article: "Yaourt", conditionnement: "Pack 12x125g", mots: ["gros pack yaourt", "12 yaourts", "pack danone", "pack 12 yaourt", "12x yaourt"], quantiteAuto: 1 },
    "fromage": { categorie: "Produits laitiers", article: "Fromage", conditionnement: "Emmental", mots: ["fromage", "emmental", "gruyère", "président"], quantiteAuto: 1 },
    "beurre": { categorie: "Produits laitiers", article: "Beurre", conditionnement: "250g", mots: ["beurre", "président", "elle et vire"], quantiteAuto: 1 },
    "crème": { categorie: "Produits laitiers", article: "Crème fraîche", conditionnement: "Épaisse", mots: ["crème", "fraiche", "épaisse"], quantiteAuto: 1 },

    // Épicerie (différents formats)
    "riz": { categorie: "Épicerie", article: "Riz", conditionnement: "1kg", mots: ["riz", "basmati", "uncle ben", "thaï"] },
    "riz gros": { categorie: "Épicerie", article: "Riz", conditionnement: "5kg", mots: ["gros sac riz", "riz 5kg", "sac familial"] },
    "riz petit": { categorie: "Épicerie", article: "Riz", conditionnement: "500g", mots: ["petit riz", "riz 500g", "petite quantité"] },
    "pâtes": { categorie: "Épicerie", article: "Pâtes", conditionnement: "500g", mots: ["pâtes", "spaghetti", "penne", "barilla", "panzani"] },
    "pâtes gros": { categorie: "Épicerie", article: "Pâtes", conditionnement: "1kg", mots: ["gros paquet pâtes", "pâtes 1kg", "pâtes familial"] },
    "huile": { categorie: "Épicerie", article: "Huile", conditionnement: "1L", mots: ["huile", "olive", "tournesol", "lesieur", "puget"] },
    "farine": { categorie: "Épicerie", article: "Farine", conditionnement: "1kg", mots: ["farine", "type 55", "francine"] },
    "sucre": { categorie: "Épicerie", article: "Sucre", conditionnement: "1kg", mots: ["sucre", "blanc", "roux", "daddy"] },

    // Fruits et légumes
    "bananes": { categorie: "Fruits et légumes", article: "Bananes", conditionnement: "au kg", mots: ["bananes", "banane", "antilles"] },
    "pommes": { categorie: "Fruits et légumes", article: "Pommes", conditionnement: "au kg", mots: ["pommes", "pomme", "golden", "gala"] },
    "tomates": { categorie: "Fruits et légumes", article: "Tomates", conditionnement: "au kg", mots: ["tomates", "tomate", "grappe", "cerises"] },
    "carottes": { categorie: "Fruits et légumes", article: "Carottes", conditionnement: "1kg", mots: ["carottes", "carotte", "nouvelles"] },
    "pommes de terre": { categorie: "Fruits et légumes", article: "Pommes de terre", conditionnement: "2kg", mots: ["pommes de terre", "patates", "charlotte", "bintje"] },

    // Viandes et poissons
    "poulet": { categorie: "Viandes et poissons", article: "Poulet", conditionnement: "au kg", mots: ["poulet", "blanc", "cuisses", "entier"] },
    "bœuf": { categorie: "Viandes et poissons", article: "Boeuf", conditionnement: "au kg", mots: ["boeuf", "bœuf", "steaks", "haché"] },
    "porc": { categorie: "Viandes et poissons", article: "Porc", conditionnement: "au kg", mots: ["porc", "côtes", "jambon", "lardons"] },
    "saumon": { categorie: "Viandes et poissons", article: "Poisson", conditionnement: "Saumon", mots: ["saumon", "poisson", "filet"] },
    "thon": { categorie: "Viandes et poissons", article: "Poisson", conditionnement: "boîte", mots: ["thon", "petit navire", "saupiquet"] },

    // Boulangerie
    "pain": { categorie: "Boulangerie", article: "Pain", conditionnement: "Baguette", mots: ["pain", "baguette", "tradition"] },
    "pain de mie": { categorie: "Boulangerie", article: "Pain de mie", conditionnement: "500g", mots: ["pain de mie", "harry's", "jacquet"] },
    "croissants": { categorie: "Boulangerie", article: "Viennoiseries", conditionnement: "Croissants", mots: ["croissants", "viennoiseries"] },

    // Boissons - Eau (différents formats)
    "eau plate": { categorie: "Boissons", article: "Eau", conditionnement: "Plate", mots: ["eau plate", "évian", "cristalline", "vittel"], quantiteAuto: 1 },
    "eau plate pack": { categorie: "Boissons", article: "Eau", conditionnement: "Pack Plate", mots: ["pack eau plate", "pack évian", "pack cristalline", "6 bouteilles", "pack 6", "6x"], quantiteAuto: 1 },
    "eau gazeuse": { categorie: "Boissons", article: "Eau", conditionnement: "Gazeuse", mots: ["eau gazeuse", "perrier", "badoit", "san pellegrino"], quantiteAuto: 1 },
    "eau gazeuse pack": { categorie: "Boissons", article: "Eau", conditionnement: "Pack Gazeuse", mots: ["pack eau gazeuse", "pack perrier", "pack badoit", "6 bouteilles gazeuse", "pack 6", "6x gazeuse"], quantiteAuto: 1 },
    "eau gazeuse petite": { categorie: "Boissons", article: "Eau", conditionnement: "Gazeuse Petite", mots: ["petite eau gazeuse", "perrier 50cl", "badoit 50cl", "petite bouteille"], quantiteAuto: 1 },
    "eau aromatisée": { categorie: "Boissons", article: "Eau", conditionnement: "Aromatisée", mots: ["eau aromatisée", "volvic", "cristaline citron"], quantiteAuto: 1 },
    "eau aromatisée pack": { categorie: "Boissons", article: "Eau", conditionnement: "Pack Aromatisée", mots: ["pack eau aromatisée", "pack volvic", "6 bouteilles aromatisées", "pack 6 aromatisée"], quantiteAuto: 1 },
    // Boissons - Sodas (différents formats)
    "coca": { categorie: "Boissons", article: "Sodas", conditionnement: "Cola Grande", mots: ["coca", "cola", "pepsi"], quantiteAuto: 1 },
    "coca pack": { categorie: "Boissons", article: "Sodas", conditionnement: "Pack Cola", mots: ["pack coca", "pack cola", "6 canettes", "canettes coca", "pack 6 coca", "6x coca"], quantiteAuto: 1 },
    "coca canette": { categorie: "Boissons", article: "Sodas", conditionnement: "Cola Canette", mots: ["canette coca", "canette cola", "33cl coca"], quantiteAuto: 1 },
    "fanta": { categorie: "Boissons", article: "Sodas", conditionnement: "Orange Grande", mots: ["fanta", "orange", "orangina"], quantiteAuto: 1 },
    "fanta pack": { categorie: "Boissons", article: "Sodas", conditionnement: "Pack Orange", mots: ["pack fanta", "pack orange", "6 canettes orange"], quantiteAuto: 1 },
    "sprite": { categorie: "Boissons", article: "Sodas", conditionnement: "Limonade Grande", mots: ["sprite", "limonade", "7up"], quantiteAuto: 1 },
    "sprite pack": { categorie: "Boissons", article: "Sodas", conditionnement: "Pack Limonade", mots: ["pack sprite", "pack limonade", "6 canettes sprite"], quantiteAuto: 1 },
    
    // Boissons - Jus (différents formats)
    "jus orange": { categorie: "Boissons", article: "Jus de fruits", conditionnement: "Orange", mots: ["jus orange", "tropicana", "minute maid"], quantiteAuto: 1 },
    "jus orange pack": { categorie: "Boissons", article: "Jus de fruits", conditionnement: "Pack Orange", mots: ["pack jus orange", "briquettes orange", "6 briquettes"], quantiteAuto: 1 },
    "jus pomme": { categorie: "Boissons", article: "Jus de fruits", conditionnement: "Pomme", mots: ["jus pomme", "andros"], quantiteAuto: 1 },
    "jus pomme pack": { categorie: "Boissons", article: "Jus de fruits", conditionnement: "Pack Pomme", mots: ["pack jus pomme", "briquettes pomme"], quantiteAuto: 1 },
    "café": { categorie: "Boissons", article: "Café", conditionnement: "Moulu", mots: ["café", "nescafé", "maxwell", "soluble"], quantiteAuto: 1 },
    "thé": { categorie: "Boissons", article: "Thé", conditionnement: "Sachets", mots: ["thé", "lipton", "twinings", "infusion"], quantiteAuto: 1 }
  });

  // Base produits structurée avec EAN et catégorisation
  const produitsExemples = [
    {
      id: 1,
      nom: "Lait UHT Lactel 1L",
      ean: "3033710065844",
      image: "🥛",
      categorie: "Produits laitiers",
      type: "marque_nationale",
      marque: "Lactel",
      conditionnement: "1L",
      prix: [
        { magasin: "Leader Price Cayenne", prix: 2.10, date: "2024-08-24", verified: true },
        { magasin: "Carrefour Market", prix: 2.45, date: "2024-08-23", verified: true },
        { magasin: "Super U Kourou", prix: 2.38, date: "2024-08-22", verified: false }
      ],
      evolution: -0.15,
      suivi: false,
      alertes: 2,
      historique: [
        { date: "2024-07-24", prix: 2.25 },
        { date: "2024-08-01", prix: 2.20 },
        { date: "2024-08-15", prix: 2.15 },
        { date: "2024-08-24", prix: 2.10 }
      ]
    },
    {
      id: 2,
      nom: "Riz Basmati Uncle Ben's 1kg",
      ean: "3033710074556",
      image: "🍚",
      categorie: "Épicerie",
      type: "marque_nationale",
      marque: "Uncle Ben's",
      conditionnement: "1kg",
      prix: [
        { magasin: "Leader Price Cayenne", prix: 4.85, date: "2024-08-24", verified: true },
        { magasin: "Super U Kourou", prix: 5.20, date: "2024-08-22", verified: true },
        { magasin: "Carrefour Market", prix: 5.10, date: "2024-08-23", verified: false }
      ],
      evolution: 0.25,
      suivi: true,
      alertes: 0,
      historique: [
        { date: "2024-07-24", prix: 4.60 },
        { date: "2024-08-01", prix: 4.70 },
        { date: "2024-08-15", prix: 4.80 },
        { date: "2024-08-24", prix: 4.85 }
      ]
    },
    {
      id: 3,
      nom: "Bananes Antilles",
      ean: null,
      image: "🍌",
      categorie: "Fruits et légumes",
      type: "frais_variable",
      marque: null,
      conditionnement: "au kg",
      prix: [
        { magasin: "Marché de Cayenne", prix: 2.80, date: "2024-08-24", verified: true },
        { magasin: "Carrefour Market", prix: 3.20, date: "2024-08-23", verified: true },
        { magasin: "Super U Kourou", prix: 2.95, date: "2024-08-22", verified: false }
      ],
      evolution: -0.10,
      suivi: false,
      alertes: 0,
      historique: [
        { date: "2024-07-24", prix: 2.90 },
        { date: "2024-08-01", prix: 2.85 },
        { date: "2024-08-15", prix: 2.82 },
        { date: "2024-08-24", prix: 2.80 }
      ]
    },
    {
      id: 4,
      nom: "Yaourt U Bio Nature x8",
      ean: "3256220161459",
      image: "🥄",
      categorie: "Produits laitiers",
      type: "mdd",
      marque: "U Bio",
      conditionnement: "8x125g",
      enseigne_exclusive: "Super U",
      prix: [
        { magasin: "Super U Kourou", prix: 3.45, date: "2024-08-24", verified: true },
        { magasin: "Hyper U Cayenne", prix: 3.40, date: "2024-08-23", verified: true }
      ],
      evolution: 0.05,
      suivi: false,
      alertes: 0,
      historique: [
        { date: "2024-07-24", prix: 3.40 },
        { date: "2024-08-01", prix: 3.42 },
        { date: "2024-08-15", prix: 3.43 },
        { date: "2024-08-24", prix: 3.45 }
      ]
    },
    {
      id: 5,
      nom: "Huile Tournesol Lesieur 1L",
      ean: "3033710078264",
      image: "🫒",
      categorie: "Épicerie",
      type: "marque_nationale",
      marque: "Lesieur",
      conditionnement: "1L",
      prix: [
        { magasin: "Leader Price Cayenne", prix: 3.95, date: "2024-08-24", verified: true },
        { magasin: "Carrefour Market", prix: 4.50, date: "2024-08-23", verified: true },
        { magasin: "Super U Kourou", prix: 4.25, date: "2024-08-22", verified: true }
      ],
      evolution: -0.25,
      suivi: false,
      alertes: 1
    },
    {
      id: 6,
      nom: "Pain de Mie Harry's",
      ean: "3228857000285",
      image: "🍞",
      categorie: "Boulangerie",
      type: "marque_nationale",
      marque: "Harry's",
      conditionnement: "500g",
      prix: [
        { magasin: "Leader Price Cayenne", prix: 2.85, date: "2024-08-24", verified: true },
        { magasin: "Carrefour Market", prix: 3.25, date: "2024-08-23", verified: false },
        { magasin: "Super U Kourou", prix: 3.10, date: "2024-08-22", verified: true }
      ],
      evolution: 0.10,
      suivi: true,
      alertes: 0
    }
  ];

  const [enseignes] = useState([
    { nom: "Leader Price", note: "★★★★★", indiceVieChere: 82, ville: "Cayenne", specialite: "Hard discount" },
    { nom: "Super U", note: "★★★★☆", indiceVieChere: 89, ville: "Kourou", specialite: "Proximité" },
    { nom: "Carrefour Market", note: "★★★☆☆", indiceVieChere: 94, ville: "Cayenne", specialite: "Grande surface" },
    { nom: "Hyper U", note: "★★★★☆", indiceVieChere: 91, ville: "Cayenne", specialite: "Hypermarché" },
    { nom: "Match", note: "★★★☆☆", indiceVieChere: 96, ville: "Kourou", specialite: "Proximité" },
    { nom: "Géant Casino", note: "★★★☆☆", indiceVieChere: 95, ville: "Cayenne", specialite: "Hypermarché" },
    { nom: "Marché de Cayenne", note: "★★★★★", indiceVieChere: 78, ville: "Cayenne", specialite: "Marché local" },
    { nom: "Marché de Kourou", note: "★★★★☆", indiceVieChere: 80, ville: "Kourou", specialite: "Marché local" }
  ]);

  // Base de données complète des produits alimentaires
  const [categoriesAlimentaires] = useState({
    "Produits laitiers": {
      emoji: "🥛",
      articles: {
        "Lait": ["UHT", "Frais", "Bio", "Écrémé", "Demi-écrémé", "Entier"],
        "Yaourt": ["Nature", "Aux fruits", "Grec", "Bio", "0%"],
        "Fromage": ["Emmental", "Gruyère", "Camembert", "Chèvre", "Roquefort"],
        "Beurre": ["Doux", "Salé", "Bio", "Allégé"],
        "Crème fraîche": ["Épaisse", "Liquide", "Allégée"]
      }
    },
    "Épicerie": {
      emoji: "🍚",
      articles: {
        "Riz": ["Basmati", "Thaï", "Complet", "Rond", "Long"],
        "Pâtes": ["Spaghetti", "Penne", "Fusilli", "Coquillettes", "Lasagnes"],
        "Huile": ["Olive", "Tournesol", "Colza", "Arachide"],
        "Farine": ["Type 55", "Complète", "Bio", "Sans gluten"],
        "Sucre": ["Blanc", "Roux", "Cassonade", "Édulcorant"]
      }
    },
    "Fruits et légumes": {
      emoji: "🍌",
      articles: {
        "Bananes": ["Antilles", "Bio", "Équateur"],
        "Pommes": ["Golden", "Gala", "Granny", "Bio"],
        "Tomates": ["Grappe", "Cerises", "Bio", "Coeur de boeuf"],
        "Carottes": ["Nouvelles", "Bio", "Râpées"],
        "Pommes de terre": ["Nouvelles", "Charlotte", "Bintje"]
      }
    },
    "Viandes et poissons": {
      emoji: "🥩",
      articles: {
        "Poulet": ["Entier", "Blanc", "Cuisses", "Bio", "Label Rouge"],
        "Boeuf": ["Steaks", "Rosbif", "Haché", "Bio"],
        "Porc": ["Côtes", "Rôti", "Jambon", "Lardons"],
        "Poisson": ["Saumon", "Cabillaud", "Thon", "Sardines"],
        "Crevettes": ["Roses", "Grises", "Tropicales"]
      }
    },
    "Boulangerie": {
      emoji: "🍞",
      articles: {
        "Pain": ["Baguette", "Complet", "Céréales", "Sans gluten"],
        "Pain de mie": ["Nature", "Complet", "Sans croûte"],
        "Viennoiseries": ["Croissants", "Pain au chocolat", "Brioches"],
        "Biscottes": ["Nature", "Complètes", "Sans sel"]
      }
    },
    "Boissons": {
      emoji: "🥤",
      articles: {
        "Eau": ["Plate", "Gazeuse", "Aromatisée"],
        "Jus de fruits": ["Orange", "Pomme", "Tropical", "Bio"],
        "Sodas": ["Cola", "Limonade", "Orange", "Sans sucre"],
        "Café": ["Moulu", "Grains", "Soluble", "Capsules"],
        "Thé": ["Noir", "Vert", "Infusions", "Bio"]
      }
    }
  });

  const [marquesAlimentaires] = useState({
    // Marques nationales principales
    "Marques nationales": [
      "Danone", "Lactel", "Président", "Bonne Maman", "Lu", "Nestlé", 
      "Coca-Cola", "Pepsi", "Évian", "Perrier", "Hénaff", "Bonduelle",
      "Uncle Ben's", "Barilla", "Panzani", "Lesieur", "Isio 4", "Puget",
      "Ferrero", "Haribo", "Lindt", "Milka", "Kinder", "Nutella",
      "Kellogg's", "Quaker", "Bjorg", "Fleury Michon", "Herta", "Aoste",
      "Findus", "Picard", "Marie", "Charal", "Bigard", "Doux",
      "Labeyrie", "Petit Navire", "Saupiquet", "Connétable", "Raynal et Roquelaure"
    ],
    // Marques distributeur
    "Marques distributeur": {
      "Carrefour": ["Carrefour", "Carrefour Bio", "Carrefour Discount", "Reflets de France"],
      "Super U": ["U", "U Bio", "U Tout Petits", "Saveurs"],
      "Leader Price": ["Leader Price", "Eco+", "Pouce"]
    },
    // Marques locales Guyane
    "Marques locales": [
      "Délices de Guyane", "Saveurs Créoles", "Planteurs de Guyane", 
      "Rhum Saint-Maurice", "Confiture Mama", "Épices Amazonie"
    ]
  });

  const [panierTypes] = useState({
    famille: {
      nom: "👨‍👩‍👧‍👦 Famille (4 personnes)",
      emoji: "👨‍👩‍👧‍👦",
      produits: [
        { nom: "Lait UHT 1L x4", prix: { "Leader Price": 8.40, "Carrefour": 9.80, "Super U": 9.52 }},
        { nom: "Riz 5kg", prix: { "Leader Price": 18.50, "Carrefour": 22.30, "Super U": 20.80 }},
        { nom: "Pack eau 6L", prix: { "Leader Price": 2.95, "Carrefour": 3.45, "Super U": 3.20 }},
        { nom: "Poulet entier", prix: { "Leader Price": 12.80, "Carrefour": 14.50, "Super U": 13.90 }},
        { nom: "Bananes 2kg", prix: { "Leader Price": 5.60, "Carrefour": 6.40, "Super U": 5.90 }}
      ]
    },
    etudiant: {
      nom: "🎓 Étudiant",
      emoji: "🎓",
      produits: [
        { nom: "Pâtes 1kg", prix: { "Leader Price": 1.85, "Carrefour": 2.20, "Super U": 2.05 }},
        { nom: "Thon boîte x3", prix: { "Leader Price": 4.50, "Carrefour": 5.20, "Super U": 4.85 }},
        { nom: "Pain de mie", prix: { "Leader Price": 1.95, "Carrefour": 2.45, "Super U": 2.20 }},
        { nom: "Café soluble", prix: { "Leader Price": 6.80, "Carrefour": 7.90, "Super U": 7.35 }},
        { nom: "Conserves légumes x4", prix: { "Leader Price": 5.20, "Carrefour": 6.80, "Super U": 6.00 }}
      ]
    },
    sportif: {
      nom: "💪 Sportif",
      emoji: "💪",
      produits: [
        { nom: "Blanc de poulet 1kg", prix: { "Leader Price": 16.50, "Carrefour": 18.90, "Super U": 17.80 }},
        { nom: "Flocons d'avoine 1kg", prix: { "Leader Price": 3.45, "Carrefour": 4.20, "Super U": 3.85 }},
        { nom: "Bananes 3kg", prix: { "Leader Price": 8.40, "Carrefour": 9.60, "Super U": 8.85 }},
        { nom: "Yaourts protéinés x12", prix: { "Leader Price": 8.90, "Carrefour": 10.50, "Super U": 9.75 }},
        { nom: "Œufs x18", prix: { "Leader Price": 4.20, "Carrefour": 5.10, "Super U": 4.65 }}
      ]
    }
  });

  const [defisHebdo] = useState([
    { 
      id: 1, 
      titre: "Scanner 5 nouveaux produits", 
      description: "Aide la communauté en ajoutant 5 prix", 
      progression: 3, 
      objectif: 5, 
      recompense: "50 points + badge Scanner Pro",
      expires: "dans 3 jours"
    },
    { 
      id: 2, 
      titre: "Signaler un prix abusif", 
      description: "Dénonce un prix anormalement élevé", 
      progression: 0, 
      objectif: 1, 
      recompense: "1 semaine Premium gratuit",
      expires: "dans 5 jours"
    },
    { 
      id: 3, 
      titre: "Valider 10 prix communautaires", 
      description: "Confirme des prix ajoutés par d'autres", 
      progression: 7, 
      objectif: 10, 
      recompense: "Badge Vérificateur + 30 points",
      expires: "dans 2 jours"
    }
  ]);

  const [notifications] = useState([
    { id: 1, type: "baisse", produit: "Lait UHT 1L", prix: 2.10, magasin: "Leader Price", temps: "Il y a 2h" },
    { id: 2, type: "alerte", produit: "Riz Basmati 1kg", prix: 4.85, magasin: "Leader Price", temps: "Il y a 4h" },
    { id: 3, type: "promo", produit: "Huile tournesol 1L", reduction: "15%", magasin: "Super U", temps: "Il y a 1h" }
  ]);

  const [communaute] = useState([
    { utilisateur: "Marie973", produit: "Bananes Antilles 1kg", prix: 2.80, magasin: "Marché de Cayenne", temps: "Il y a 2h", verified: true },
    { utilisateur: "TiPierre", produit: "Pain de mie Harry's", prix: 3.65, magasin: "Super U Kourou", temps: "Il y a 4h", verified: false },
    { utilisateur: "GuyaneFan", produit: "Beurre Président 250g", prix: 4.20, magasin: "Leader Price", temps: "Il y a 6h", verified: true }
  ]);

  const calculerPanierTotal = (typePanier, enseigne) => {
    return panierTypes[typePanier].produits.reduce((total, produit) => {
      return total + (produit.prix[enseigne] || 0);
    }, 0);
  };

  const calculerMeilleurPanier = (typePanier) => {
    const enseignes = ["Leader Price", "Carrefour", "Super U"];
    let meilleur = { enseigne: "", total: Infinity, economie: 0 };
    let pire = { enseigne: "", total: 0 };

    enseignes.forEach(enseigne => {
      const total = calculerPanierTotal(typePanier, enseigne);
      if (total < meilleur.total) {
        meilleur = { enseigne, total, economie: 0 };
      }
      if (total > pire.total) {
        pire = { enseigne, total };
      }
    });

    meilleur.economie = pire.total - meilleur.total;
    return meilleur;
  };

  const toggleSuivi = (produitId) => {
    if (!user.premium && suiviProduits.length >= 3) {
      alert("Version gratuite limitée à 3 produits suivis. Passez Premium pour un suivi illimité !");
      return;
    }
    
    if (suiviProduits.includes(produitId)) {
      setSuiviProduits(suiviProduits.filter(id => id !== produitId));
    } else {
      setSuiviProduits([...suiviProduits, produitId]);
    }
  };

  const simulateScanner = () => {
    setScannerActive(true);
    
    // Animation de scan
    setTimeout(() => {
      const scenarios = [
        { ean: "3033710065844", nom: "Lait UHT Lactel 1L", type: "found", produit: produits.find(p => p.ean === "3033710065844") },
        { ean: "1234567890123", nom: "Nouveau produit", type: "new" },
        { ean: null, nom: "Code-barres illisible", type: "error" }
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      setScannerActive(false);
      
      if (scenario.type === "found") {
        alert(`🎉 Produit scanné avec succès !\n\n✅ ${scenario.nom}\n🏪 ${scenario.produit?.prix.length || 0} prix disponibles\n💰 Économie max: ${scenario.produit ? (Math.max(...scenario.produit.prix.map(p => p.prix)) - Math.min(...scenario.produit.prix.map(p => p.prix))).toFixed(2) : '0.00'}€`);
      } else if (scenario.type === "new") {
        alert(`🆕 Nouveau produit détecté !\n\nEAN: ${scenario.ean}\n➕ Voulez-vous l'ajouter à notre base ?\n🎁 +10 points de récompense !`);
      } else {
        alert(`⚠️ Scan échoué\n\n❌ Code-barres illisible\n💡 Conseils:\n• Mieux éclairer le code\n• Tenir le téléphone stable\n• Nettoyer l'objectif`);
      }
    }, 2000);
  };

  const handleAddProduct = () => {
    if (!newProduct.categorie || !newProduct.article || !newProduct.marque || !newProduct.prix || !newProduct.magasin) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    // Simulation d'ajout à la base de données
    const nouveauProduit = {
      id: produits.length + 1,
      nom: `${newProduct.article} ${newProduct.marque} ${newProduct.conditionnement}`,
      ean: null, // Produit ajouté manuellement
      image: categoriesAlimentaires[newProduct.categorie]?.emoji || "📦",
      categorie: newProduct.categorie,
      type: "frais_variable",
      marque: newProduct.marque,
      conditionnement: newProduct.conditionnement,
      prix: [{
        magasin: newProduct.magasin,
        prix: parseFloat(newProduct.prix),
        date: new Date().toISOString().split('T')[0],
        verified: false
      }],
      evolution: 0,
      suivi: false,
      alertes: 0
    };

    alert(`🎉 Produit ajouté avec succès !\n\n${nouveauProduit.nom}\n💰 ${newProduct.prix}€ chez ${newProduct.magasin}\n\n+10 points de récompense !`);
    
    // Reset du formulaire
    setNewProduct({
      categorie: '',
      article: '',
      marque: '',
      conditionnement: '',
      prix: '',
      magasin: ''
    });
    setSearchProduct('');
    setShowAddProduct(false);
  };

  // Fonction pour détecter les quantités dans le texte
  const detecterQuantite = (searchTerm) => {
    const terme = searchTerm.toLowerCase().trim();
    
    // Patterns pour détecter les quantités
    const patterns = [
      { regex: /(\d+)x/i, multiplier: 1 },           // "6x eau" -> 6
      { regex: /x(\d+)/i, multiplier: 1 },           // "x6 eau" -> 6
      { regex: /pack\s*(\d+)/i, multiplier: 1 },     // "pack 6" -> 6
      { regex: /(\d+)\s*pack/i, multiplier: 1 },     // "6 pack" -> 6
      { regex: /lot\s*(\d+)/i, multiplier: 1 },      // "lot 3" -> 3
      { regex: /(\d+)\s*lot/i, multiplier: 1 },      // "3 lot" -> 3
      { regex: /(\d+)\s*bouteilles?/i, multiplier: 1 }, // "6 bouteilles" -> 6
      { regex: /(\d+)\s*canettes?/i, multiplier: 1 },   // "12 canettes" -> 12
      { regex: /(\d+)\s*briques?/i, multiplier: 1 },    // "6 briques" -> 6
      { regex: /(\d+)\s*yaourts?/i, multiplier: 1 },    // "12 yaourts" -> 12
      { regex: /(\d+)\s*pots?/i, multiplier: 1 },       // "4 pots" -> 4
    ];
    
    for (const pattern of patterns) {
      const match = terme.match(pattern.regex);
      if (match) {
        const quantite = parseInt(match[1]) * pattern.multiplier;
        return quantite > 0 && quantite <= 99 ? quantite : 1;
      }
    }
    
    return 1; // Quantité par défaut
  };

  const rechercheIntelligente = (searchTerm, detectQuantity = true) => {
    const terme = searchTerm.toLowerCase().trim();
    
    // Recherche directe dans les clés
    if (reconnaissanceProduits[terme]) {
      return { 
        ...reconnaissanceProduits[terme], 
        quantiteDetectee: detectQuantity ? detecterQuantite(searchTerm) : 1
      };
    }
    
    // Recherche dans les mots-clés
    for (const [key, produit] of Object.entries(reconnaissanceProduits)) {
      if (produit.mots.some(mot => terme.includes(mot) || mot.includes(terme))) {
        return { 
          ...produit, 
          quantiteDetectee: detectQuantity ? detecterQuantite(searchTerm) : 1
        };
      }
    }
    
    return null;
  };

  const getSuggestions = (searchTerm) => {
    const terme = searchTerm.toLowerCase().trim();
    if (terme.length < 2) return [];

    const suggestions = [];
    
    // Recherche dans toutes les clés et mots-clés
    for (const [key, produit] of Object.entries(reconnaissanceProduits)) {
      const score = getMatchScore(terme, key, produit);
      if (score > 0) {
        suggestions.push({
          ...produit,
          key,
          score,
          displayName: `${produit.article} ${produit.conditionnement}`,
          emoji: categoriesAlimentaires[produit.categorie]?.emoji || "📦",
          quantiteDetectee: 1 // Toujours 1 pour les suggestions, l'utilisateur choisit ensuite
        });
      }
    }
    
    // Tri par score de pertinence
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // Maximum 6 suggestions
  };

  const getMatchScore = (terme, key, produit) => {
    let score = 0;
    
    // Match exact avec la clé
    if (key.includes(terme) || terme.includes(key)) score += 10;
    
    // Match avec les mots-clés
    produit.mots.forEach(mot => {
      if (mot.includes(terme) || terme.includes(mot)) score += 5;
    });
    
    // Match avec l'article
    if (produit.article.toLowerCase().includes(terme)) score += 8;
    
    return score;
  };

  const handleSearchProduct = (searchTerm) => {
    setSearchProduct(searchTerm);
    
    // Générer les suggestions
    const suggestions = getSuggestions(searchTerm);
    setSearchSuggestions(suggestions);
    
    // Auto-remplir si match exact
    const resultat = rechercheIntelligente(searchTerm);
    if (resultat) {
      setNewProduct({
        ...newProduct,
        categorie: resultat.categorie,
        article: resultat.article,
        conditionnement: resultat.conditionnement
      });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuickAddProduct({
      nom: suggestion.displayName,
      categorie: suggestion.categorie,
      article: suggestion.article,
      conditionnement: suggestion.conditionnement,
      emoji: suggestion.emoji,
      quantiteDetectee: 1 // Toujours 1 pour les suggestions, l'utilisateur ajuste avec les boutons +/-
    });
    setShowQuickAdd(true);
    setSearchProduct('');
    setSearchSuggestions([]);
  };

  const handleQuickAdd = (prix, magasin, marque, quantite = 1) => {
    if (!prix || !magasin || !marque || !quantite) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    const prixUnitaire = parseFloat(prix);
    const qte = parseInt(quantite);
    const prixTotal = prixUnitaire * qte;

    const nouveauProduit = {
      id: produits.length + 1,
      nom: `${quickAddProduct.article} ${marque} ${quickAddProduct.conditionnement}`,
      ean: null,
      image: quickAddProduct.emoji,
      categorie: quickAddProduct.categorie,
      type: "frais_variable",
      marque: marque,
      conditionnement: quickAddProduct.conditionnement,
      quantite: qte,
      prixUnitaire: prixUnitaire,
      prixTotal: prixTotal,
      prix: [{
        magasin: magasin,
        prix: prixUnitaire,
        quantite: qte,
        prixTotal: prixTotal,
        date: new Date().toISOString().split('T')[0],
        verified: false
      }],
      evolution: 0,
      suivi: false,
      alertes: 0
    };

    const messageQuantite = qte > 1 ? `${qte}x ` : '';
    const messagePrix = qte > 1 ? `${prixUnitaire}€/unité (Total: ${prixTotal.toFixed(2)}€)` : `${prixUnitaire}€`;
    
    alert(`🎉 Produit ajouté rapidement !\n\n${messageQuantite}${nouveauProduit.nom}\n💰 ${messagePrix} chez ${magasin}\n\n+10 points de récompense !`);
    
    setShowQuickAdd(false);
    setQuickAddProduct(null);
    setShowAddProduct(false);
  };

  const AccueilTab = () => {
    const meilleurPanier = calculerMeilleurPanier(selectedPanier);
    const progressionObjectif = (user.economiesMensuelle / user.objectifMensuel) * 100;

    return (
      <div className="p-4 space-y-6">
        {/* Header épuré */}
        <div className="flex items-center mb-4">
          {/* Logo PrixKoté à gauche */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform rotate-12">
                <span className="text-sm">🛒</span>
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
            </div>
            <h1 className="text-xl font-black text-gray-800">PrixKoté</h1>
          </div>
          
          {/* Slogan centré sur la droite */}
          <div className="flex-1 flex justify-center items-center pl-8">
            <p className="text-sm font-medium text-gray-600 italic text-center">"L'appli qui te fait économiser plus que son prix"</p>
          </div>
        </div>

        {/* Section scanner modernisée */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 shadow-xl border border-purple-100 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">📱</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Scanner un produit</h2>
            <p className="text-sm text-gray-600">Utilisez la caméra pour scanner un code-barres</p>
          </div>
          
          {/* Bouton scanner principal modernisé */}
          <button 
            onClick={simulateScanner}
            disabled={scannerActive}
            className={`w-full py-6 rounded-2xl flex items-center justify-center space-x-4 text-lg font-bold shadow-2xl transition-all duration-500 relative overflow-hidden ${
              scannerActive 
                ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 animate-pulse cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-105 hover:shadow-3xl active:scale-95'
            } text-white group`}
          >
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${scannerActive ? 'bg-white/20' : 'bg-white/10'} transition-all`}>
                <span className="text-2xl">{scannerActive ? '📡' : '📷'}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold">{scannerActive ? 'Scan en cours...' : 'Scanner maintenant'}</span>
                <span className="text-xs opacity-75">{scannerActive ? 'Analyse du code-barres' : 'Pointez vers le code-barres'}</span>
              </div>
              {scannerActive && <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            </div>
          </button>
        </div>

        {/* Section ajout manuel séparée */}
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-6 shadow-xl border border-emerald-100 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">✏️</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">Ajout manuel</h2>
            <p className="text-sm text-gray-600">Recherchez et ajoutez vos produits facilement</p>
          </div>

          {/* Bouton d'ajout manuel principal modernisé */}
          <button
            onClick={() => setShowAddProduct(true)}
            className="w-full py-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-4 transition-all duration-500 transform hover:scale-105 shadow-2xl relative overflow-hidden group mb-6"
          >
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">➕</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold">Ajouter un produit</span>
                <span className="text-xs opacity-75">Recherche intelligente disponible</span>
              </div>
            </div>
          </button>

          {/* Suggestions rapides modernisées */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">🚀 Exemples populaires</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                {emoji: '🥛', name: 'Lait', search: 'lait'},
                {emoji: '🍚', name: 'Riz', search: 'riz'},
                {emoji: '🍌', name: 'Bananes', search: 'bananes'},
                {emoji: '🫒', name: 'Huile', search: 'huile'},
                {emoji: '🍞', name: 'Pain', search: 'pain'},
                {emoji: '💧', name: 'Eau', search: 'eau'},
                {emoji: '🥤', name: 'Coca', search: 'coca'}
              ].map((item, index) => (
                <button
                  key={index}
                  className="bg-white hover:bg-gradient-to-r hover:from-emerald-100 hover:to-green-100 border border-emerald-200 hover:border-emerald-300 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                  onClick={() => {
                    setShowAddProduct(true);
                    setTimeout(() => {
                      const searchInput = document.getElementById('searchProduct');
                      if (searchInput) {
                        searchInput.value = item.search;
                        searchInput.focus();
                        // Trigger the search
                        const event = new Event('input', { bubbles: true });
                        searchInput.dispatchEvent(event);
                      }
                    }, 100);
                  }}
                >
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section économies motivationnelle modernisée */}
        <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <h3 className="font-bold text-xl mb-3 flex items-center">
              💰 <span className="ml-2">Tes économies ce mois</span>
            </h3>
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-5xl font-black">{user.economiesMensuelle.toFixed(2)}</span>
              <span className="text-2xl font-bold opacity-90">€</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-full h-4 mb-3 overflow-hidden">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-1000 shadow-lg"
                style={{ width: `${Math.min(progressionObjectif, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-90">
                Plus que {Math.max(0, user.objectifMensuel - user.economiesMensuelle).toFixed(2)}€ pour ton objectif
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-bold">
                {user.objectifMensuel}€
              </span>
            </div>
          </div>
        </div>

        {/* Promotions et bonnes affaires */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center text-xl">
              🔥 <span className="ml-2">Promotions du jour</span>
            </h3>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              NOUVEAU
            </span>
          </div>

          {/* Promo principale du jour */}
          <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl p-5 mb-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-bold">
                  🏆 SUPER PROMO
                </span>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -25%
                </span>
              </div>
              <h4 className="font-bold text-lg mb-1">Pack 6x1,5L Eau Cristaline</h4>
              <p className="text-sm opacity-90 mb-3">Leader Price Cayenne • Valable jusqu'au 15/12</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm line-through opacity-75">5,40€</span>
                  <span className="text-2xl font-black">4,05€</span>
                  <span className="text-xs bg-green-400 px-2 py-1 rounded-full font-bold">
                    -1,35€
                  </span>
                </div>
                <button className="bg-white text-red-500 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all transform hover:scale-105">
                  📍 Y aller
                </button>
              </div>
            </div>
          </div>

          {/* Autres promotions */}
          <div className="space-y-3">
            {[
              { 
                produit: "Lait Lactel UHT 1L", 
                magasin: "Carrefour", 
                prixNormal: "1,85€", 
                prixPromo: "1,45€", 
                reduction: "-22%",
                emoji: "🥛",
                couleur: "from-blue-100 to-blue-50"
              },
              { 
                produit: "Yaourt Danone Nature x8", 
                magasin: "Super U", 
                prixNormal: "3,20€", 
                prixPromo: "2,50€", 
                reduction: "-22%",
                emoji: "🍯",
                couleur: "from-yellow-100 to-yellow-50"
              },
              { 
                produit: "Pain de mie Harry's 500g", 
                magasin: "Leader Price", 
                prixNormal: "2,10€", 
                prixPromo: "1,60€", 
                reduction: "-24%",
                emoji: "🍞",
                couleur: "from-orange-100 to-orange-50"
              }
            ].map((promo, index) => (
              <div key={index} className={`flex items-center justify-between p-4 bg-gradient-to-r ${promo.couleur} rounded-2xl border border-gray-200 hover:shadow-lg transition-all transform hover:scale-102`}>
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{promo.emoji}</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm">{promo.produit}</h5>
                    <p className="text-xs text-gray-600">{promo.magasin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 line-through">{promo.prixNormal}</span>
                    <span className="font-bold text-green-600 text-lg">{promo.prixPromo}</span>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                    {promo.reduction}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Alertes prix personnalisées */}
          <div className="mt-5 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🔔</span>
              <h4 className="font-bold text-purple-800">Alertes prix activées</h4>
            </div>
            <p className="text-sm text-purple-700 mb-3">
              2 produits de ta liste sont en promotion cette semaine !
            </p>
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl font-bold text-sm hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
              🛒 Voir mes alertes
            </button>
          </div>
        </div>



        {/* Stats rapides modernisées */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-2">📉</div>
              <p className="text-sm font-medium opacity-90">Prix en baisse</p>
              <p className="text-3xl font-black">12</p>
              <p className="text-xs opacity-75">produits cette semaine</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full translate-y-8 -translate-x-8"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm font-medium opacity-90">Vos points</p>
              <p className="text-3xl font-black">{user.points}</p>
              <p className="text-xs opacity-75">niveau {user.niveau}</p>
            </div>
          </div>
        </div>

        {/* Explication système */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 p-4 rounded-2xl">
          <h3 className="font-semibold text-cyan-800 mb-3 flex items-center">
            🔍 <span className="ml-2">Comment ça marche ?</span>
          </h3>
          <div className="text-xs text-cyan-700 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold">📦 Marques nationales:</span>
              <span>Code-barres universel = comparaison exacte</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">🛒 Marques distributeur:</span>
              <span>Comparaison par enseigne uniquement</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">🍌 Fruits & légumes:</span>
              <span>Prix au kg par catégorie</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProduitsTab = () => {
    const produitsFiltres = produits.filter(p => 
      p.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Mes produits suivis</h2>
        
        {/* Limitation freemium */}
        {!user.premium && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-800 flex items-center">
                  ⭐ Version gratuite : {suiviProduits.length}/3 produits suivis
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Tu économises déjà {user.economiesMensuelle.toFixed(2)}€/mois !
                </p>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 shadow-md">
                🚀 Premium
              </button>
            </div>
          </div>
        )}

        {/* Liste des produits */}
        {produitsFiltres.map(produit => (
          <div key={produit.id} className="bg-white border rounded-2xl p-4 shadow-sm animate-slideUp">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{produit.image}</span>
                <div>
                  <h3 className="font-semibold">{produit.nom}</h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>EAN: {produit.ean || "Pas de code-barres"}</div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        produit.type === 'marque_nationale' ? 'badge-success' :
                        produit.type === 'mdd' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {produit.type === 'marque_nationale' ? '📦 Marque nationale' :
                         produit.type === 'mdd' ? '🛒 Marque distributeur' :
                         '🍌 Variable'}
                      </span>
                      {produit.marque && <span className="text-gray-600">• {produit.marque}</span>}
                    </div>
                    {produit.enseigne_exclusive && (
                      <div className="text-blue-600 font-medium text-xs">
                        Exclusif {produit.enseigne_exclusive}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => toggleSuivi(produit.id)}
                className={`p-2 rounded-lg text-xl transition-all ${
                  suiviProduits.includes(produit.id) 
                    ? 'text-yellow-500 bg-yellow-50' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
              >
                {suiviProduits.includes(produit.id) ? '⭐' : '☆'}
              </button>
            </div>

            {/* Prix par magasin */}
            <div className="space-y-2">
              {produit.prix.map((p, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-2">
                  <span className="flex items-center space-x-2">
                    <span>📍</span>
                    <span>{p.magasin}</span>
                    {p.verified ? (
                      <span className="text-green-500 text-xs">✓ Vérifié</span>
                    ) : (
                      <span className="text-orange-500 text-xs">⏳ En attente</span>
                    )}
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-lg">{p.prix.toFixed(2)}€</span>
                    {produit.conditionnement && (
                      <span className="text-gray-400 text-xs">/{produit.conditionnement}</span>
                    )}
                    <div className="text-gray-500 text-xs">{p.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Économie potentielle */}
            {produit.ean && produit.prix.length > 1 && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700 font-medium">💰 Économie max :</span>
                  <span className="font-bold text-green-600 text-lg">
                    {(Math.max(...produit.prix.map(p => p.prix)) - Math.min(...produit.prix.map(p => p.prix))).toFixed(2)}€
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  En choisissant le magasin le moins cher
                </p>
              </div>
            )}

            {/* Alerte MDD */}
            {produit.type === 'mdd' && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700">
                  ℹ️ Marque distributeur : comparaison limitée aux magasins {produit.enseigne_exclusive}
                </div>
              </div>
            )}

            {/* Actions et évolution */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className={`flex items-center ${
                produit.evolution > 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {produit.evolution > 0 ? '📈' : '📉'}
                <span className="ml-1 font-medium">
                  {produit.evolution > 0 ? '+' : ''}{produit.evolution.toFixed(2)}€ (30j)
                </span>
              </span>
              <div className="flex space-x-3">
                <button className="text-blue-600 hover:underline flex items-center text-xs">
                  📊 Historique
                </button>
                <button className="text-green-600 hover:underline flex items-center text-xs">
                  🎯 Alerte {user.premium ? '' : '(Premium)'}
                </button>
                <button className="text-red-600 hover:underline flex items-center text-xs">
                  🚨 Signaler
                </button>
              </div>
            </div>
          </div>
        ))}

        {produitsFiltres.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>Aucun produit trouvé</p>
            <p className="text-sm">Utilisez le scanner pour ajouter des produits</p>
          </div>
        )}
      </div>
    );
  };

  const ClassementTab = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Classement des enseignes</h2>
      
      {!user.premium && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-800">
              ⚠️ Classement détaillé disponible en Premium
            </span>
            <button className="bg-amber-600 text-white px-3 py-1 rounded-lg text-xs">
              Débloquer
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {enseignes.map((enseigne, index) => (
          <div key={index} className="bg-white border rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg font-bold text-green-600">#{index + 1}</span>
                  <h3 className="font-semibold text-lg">{enseigne.nom}</h3>
                  {index === 0 && <span className="text-yellow-500">🏆</span>}
                </div>
                <p className="text-sm text-gray-500">
                  📍 {enseigne.ville} • {enseigne.specialite}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {enseigne.indiceVieChere}/100
                </div>
                <div className="text-sm text-yellow-500">{enseigne.note}</div>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    index === 0 ? 'bg-green-500' : 
                    index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${100 - enseigne.indiceVieChere}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex justify-between items-center text-sm">
                <span>Économie moyenne par panier :</span>
                <span className={`font-bold ${
                  index === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {index === 0 ? 'Référence (meilleur)' : 
                   `+${(enseigne.indiceVieChere - enseignes[0].indiceVieChere).toFixed(1)}€`}
                </span>
              </div>
              {!user.premium && index > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Analyse détaillée disponible en Premium
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pédagogie */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-400 p-4 rounded-r-2xl shadow-sm">
        <h4 className="font-semibold text-emerald-800 mb-2">
          💡 Bon à savoir
        </h4>
        <div className="text-sm text-emerald-700 space-y-2">
          <p>L'indice est calculé sur un panier de 20 produits de base selon les prix moyens constatés par notre communauté.</p>
          <div className="mt-3 space-y-1 text-xs">
            <p><strong>📦 Marques nationales :</strong> Même code-barres = comparaison exacte</p>
            <p><strong>🛒 Marques distributeur :</strong> Prix uniquement dans leur réseau</p>
            <p><strong>🍌 Produits frais :</strong> Comparaison par catégorie au kg</p>
          </div>
        </div>
      </div>

      {/* Contexte Guyane */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-4 rounded-2xl">
        <h4 className="font-semibold text-orange-800 mb-2">
          🌴 Contexte Guyane
        </h4>
        <div className="text-sm text-orange-700 space-y-1">
          <p>• <strong>+33,9%</strong> plus cher qu'en métropole (alimentation)</p>
          <p>• <strong>Motivation forte :</strong> économies = nécessité vitale</p>
          <p>• <strong>Fierté locale :</strong> lutter ensemble contre la vie chère</p>
        </div>
      </div>
    </div>
  );

  const CommunauteTab = () => {
    const progressionNiveau = (user.points % 100) / 100 * 100;
    const pointsPourNiveauSuivant = 100 - (user.points % 100);

    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Communauté</h2>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:from-emerald-600 hover:to-teal-600 shadow-lg font-semibold">
            <span>➕</span>
            <span>Ajouter prix</span>
          </button>
        </div>

        {/* Profil utilisateur gamifié */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold mb-3 text-xl">🏆 {user.badge}</h3>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm opacity-90">Niveau {user.niveau}</p>
              <p className="text-lg font-bold">{user.points} points</p>
            </div>
            <div className="text-right">
              <div className="text-2xl">👑</div>
            </div>
          </div>
          <div className="mt-3 bg-white/20 rounded-full h-3 backdrop-blur-sm">
            <div 
              className="bg-white rounded-full h-3 shadow-sm transition-all duration-500" 
              style={{width: `${progressionNiveau}%`}}
            ></div>
          </div>
          <p className="text-xs mt-2 opacity-80">
            {pointsPourNiveauSuivant} points pour atteindre "Champion Anti Vie Chère"
          </p>
        </div>

        {/* Défis hebdomadaires */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
            🎯 <span className="ml-2">Défis de la semaine</span>
          </h3>
          <div className="space-y-3">
            {defisHebdo.map(defi => (
              <div key={defi.id} className="bg-white rounded-xl p-3 border border-yellow-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{defi.titre}</h4>
                    <p className="text-xs text-gray-600">{defi.description}</p>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">{defi.expires}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-1 bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 rounded-full h-2 transition-all duration-500"
                      style={{width: `${(defi.progression / defi.objectif) * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-yellow-700">
                    {defi.progression}/{defi.objectif}
                  </span>
                </div>
                <p className="text-xs text-green-600 font-medium">
                  🎁 {defi.recompense}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top contributeurs */}
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center">
            🥇 <span className="ml-2">Top contributeurs du mois</span>
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium">1. Marie973 🏆</span>
              <span className="font-bold text-yellow-600">1,247 pts</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-sm">2. TiPierre 🥈</span>
              <span className="font-bold text-gray-600">892 pts</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
              <span className="text-sm">3. GuyaneFan 🥉</span>
              <span className="font-bold text-orange-600">654 pts</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium">15. Vous 📈</span>
                <span className="font-bold text-blue-600">{user.points} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impact personnel */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4">
          <h3 className="font-semibold text-indigo-800 mb-3 flex items-center">
            📊 <span className="ml-2">Votre impact</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{user.prixAjoutes}</div>
              <div className="text-indigo-700">Prix ajoutés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{user.personnesAidees}</div>
              <div className="text-purple-700">Personnes aidées</div>
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-3 text-center bg-white/50 p-2 rounded-lg">
            🎉 Vos contributions ont fait économiser 245€ à la communauté ce mois-ci !
          </p>
        </div>

        {/* Feed communautaire */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700 flex items-center">
            📰 <span className="ml-2">Derniers prix ajoutés</span>
          </h3>
          {communaute.map((item, index) => (
            <div key={index} className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold flex items-center">
                    {item.produit}
                    {item.verified ? (
                      <span className="ml-2 text-green-500">✓ Vérifié</span>
                    ) : (
                      <span className="ml-2 text-orange-500">⏳ En attente</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">
                    📍 {item.magasin}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{item.prix.toFixed(2)}€</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span className="flex items-center space-x-1">
                  <span>👥</span>
                  <span>{item.utilisateur}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>{item.temps}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <button className="text-green-600 text-xs hover:underline flex items-center space-x-1 bg-green-50 px-2 py-1 rounded">
                    <span>👍</span>
                    <span>Confirmer (+5pts)</span>
                  </button>
                  <button className="text-red-600 text-xs hover:underline flex items-center space-x-1 bg-red-50 px-2 py-1 rounded">
                    <span>⚠️</span>
                    <span>Signaler</span>
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {item.verified ? '3 confirmations' : '0 confirmation'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Page de bienvenue et d'inscription
  const WelcomePage = () => {
    const [formData, setFormData] = useState({
      pseudo: '',
      email: ''
    });
    const [isLogin, setIsLogin] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.pseudo.trim()) {
        handleAuth(formData);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-fadeInScale">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-4 w-20 h-20">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center transform rotate-12 animate-float">
                <span className="text-3xl">🛒</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">973</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-gray-800 mb-2">PrixKoté</h1>
            <p className="text-sm font-medium text-gray-600 italic mb-4">
              "L'appli qui te fait économiser plus que son prix"
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                🌴 Bienvenue dans le meilleur comparateur de prix d'Outre-mer !
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✨ Compare les prix en temps réel</p>
                <p>🎯 Économise jusqu'à 30€/mois</p>
                <p>🏆 Gagne des points et des badges</p>
                <p>🤝 Aide ta communauté locale</p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                👤 Choisis ton pseudo
              </label>
              <input
                type="text"
                value={formData.pseudo}
                onChange={(e) => setFormData({...formData, pseudo: e.target.value})}
                placeholder="Ex: Alex973"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📧 Email (optionnel)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="ton.email@exemple.com"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
            >
              {isLogin ? '🚀 Se connecter' : '🎉 Commencer gratuitement'}
            </button>
          </form>

          {/* Toggle connexion/inscription */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium underline"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : "J'ai déjà un compte"}
            </button>
          </div>

          {/* Mention légale */}
          <p className="text-xs text-gray-500 text-center mt-6">
            En continuant, tu acceptes nos conditions d'utilisation
          </p>
        </div>
      </div>
    );
  };

  if (!isAuthenticated || showWelcome) {
    return <WelcomePage />;
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'accueil' && <AccueilTab />}
        {activeTab === 'produits' && <ProduitsTab />}
        {activeTab === 'classement' && <ClassementTab />}
        {activeTab === 'communaute' && <CommunauteTab />}
      </div>

      {/* Navigation bottom modernisée */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
        <div className="flex justify-around py-3">
          <button
            onClick={() => setActiveTab('accueil')}
            className={`flex flex-col items-center p-3 transition-all duration-300 relative rounded-2xl ${
              activeTab === 'accueil' 
                ? 'text-purple-600 bg-purple-50 transform scale-110' 
                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <span className="text-2xl mb-1">🔍</span>
            <span className="text-xs font-bold">Accueil</span>
            {activeTab === 'accueil' && (
              <div className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('produits')}
            className={`flex flex-col items-center p-3 transition-all duration-300 relative rounded-2xl ${
              activeTab === 'produits' 
                ? 'text-purple-600 bg-purple-50 transform scale-110' 
                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <div className="relative mb-1">
              <span className="text-2xl">🛒</span>
              {suiviProduits.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-400 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {suiviProduits.length}
                </div>
              )}
            </div>
            <span className="text-xs font-bold">Produits</span>
            {activeTab === 'produits' && (
              <div className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('classement')}
            className={`flex flex-col items-center p-3 transition-all duration-300 relative rounded-2xl ${
              activeTab === 'classement' 
                ? 'text-purple-600 bg-purple-50 transform scale-110' 
                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <span className="text-2xl mb-1">📈</span>
            <span className="text-xs font-bold">Classement</span>
            {activeTab === 'classement' && (
              <div className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('communaute')}
            className={`flex flex-col items-center p-3 transition-all duration-300 relative rounded-2xl ${
              activeTab === 'communaute' 
                ? 'text-purple-600 bg-purple-50 transform scale-110' 
                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <div className="relative mb-1">
              <span className="text-2xl">👥</span>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 w-4 h-4 rounded-full animate-pulse shadow-lg"></div>
            </div>
            <span className="text-xs font-bold">Communauté</span>
            {activeTab === 'communaute' && (
              <div className="absolute -bottom-1 w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Bouton flottant Premium modernisé */}
      {!user.premium && (
        <div className="fixed bottom-24 right-4 z-40">
          <button 
            className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce group"
            onClick={() => alert(`🚀 PRIXKOTÉ PREMIUM\n💎 Seulement 4,99€/mois\n\n✅ Suivi illimité de produits\n✅ Alertes push personnalisées\n✅ Graphiques d'évolution complets\n✅ Analyse panier avancée\n✅ Accès prioritaire aux promos\n\n💰 Tu économises déjà ${user.economiesMensuelle.toFixed(2)}€/mois !\n🎯 ROI mensuel: +${(user.economiesMensuelle - 4.99).toFixed(2)}€\n\n🔥 L'appli qui te fait économiser plus que son prix !`)}
          >
            <span className="text-2xl">⭐</span>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 group-hover:opacity-50 animate-pulse"></div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
              !
            </div>
          </button>
        </div>
      )}

      {/* Modal d'ajout de produit */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">➕ Ajouter un produit</h2>
                  <p className="text-sm opacity-90">Enrichissez notre base de données</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setSearchProduct('');
                    setNewProduct({
                      categorie: '',
                      article: '',
                      marque: '',
                      conditionnement: '',
                      prix: '',
                      magasin: ''
                    });
                  }}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Barre de recherche intelligente avec suggestions */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔍 Recherche intelligente
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tapez votre produit (ex: eau, lait, riz...)"
                    value={searchProduct}
                    onChange={(e) => handleSearchProduct(e.target.value)}
                    className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-lg bg-green-50"
                  />
                  
                  {/* Suggestions dynamiques */}
                  {searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-green-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full p-3 flex items-center space-x-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-2xl">{suggestion.emoji}</span>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-800">{suggestion.displayName}</div>
                            <div className="text-xs text-gray-500">{suggestion.categorie}</div>
                          </div>
                          <span className="text-green-600 font-medium text-sm">Cliquer pour ajouter →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-green-600 mt-2">
                  ✨ Tapez "eau" pour voir les variantes (plate, gazeuse, aromatisée) !
                </p>
                
                {searchProduct && rechercheIntelligente(searchProduct) && !searchSuggestions.length && (
                  <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-800">
                      🎯 <strong>Détecté :</strong> {rechercheIntelligente(searchProduct).categorie} → {rechercheIntelligente(searchProduct).article} ({rechercheIntelligente(searchProduct).conditionnement})
                    </p>
                  </div>
                )}
              </div>

              {/* Séparateur */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-500 bg-white">ou remplir manuellement</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Étape 1: Catégorie */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  1️⃣ Catégorie *
                </label>
                <select
                  value={newProduct.categorie}
                  onChange={(e) => setNewProduct({...newProduct, categorie: e.target.value, article: ''})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {Object.entries(categoriesAlimentaires).map(([cat, data]) => (
                    <option key={cat} value={cat}>
                      {data.emoji} {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Étape 2: Article */}
              {newProduct.categorie && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    2️⃣ Article *
                  </label>
                  <select
                    value={newProduct.article}
                    onChange={(e) => setNewProduct({...newProduct, article: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    <option value="">Sélectionnez un article</option>
                    {Object.keys(categoriesAlimentaires[newProduct.categorie].articles).map(article => (
                      <option key={article} value={article}>{article}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Étape 3: Type/Variété */}
              {newProduct.article && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    3️⃣ Type/Variété
                  </label>
                  <select
                    value={newProduct.conditionnement}
                    onChange={(e) => setNewProduct({...newProduct, conditionnement: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    <option value="">Sélectionnez le type</option>
                    {categoriesAlimentaires[newProduct.categorie].articles[newProduct.article].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Étape 4: Marque */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  4️⃣ Marque *
                </label>
                <select
                  value={newProduct.marque}
                  onChange={(e) => setNewProduct({...newProduct, marque: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">Sélectionnez une marque</option>
                  <optgroup label="🏷️ Marques nationales">
                    {marquesAlimentaires["Marques nationales"].map(marque => (
                      <option key={marque} value={marque}>{marque}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🛒 Marques distributeur">
                    {Object.entries(marquesAlimentaires["Marques distributeur"]).map(([enseigne, marques]) => 
                      marques.map(marque => (
                        <option key={marque} value={marque}>{marque} ({enseigne})</option>
                      ))
                    )}
                  </optgroup>
                  <optgroup label="🌴 Marques locales">
                    {marquesAlimentaires["Marques locales"].map(marque => (
                      <option key={marque} value={marque}>{marque}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Étape 5: Magasin */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  5️⃣ Magasin *
                </label>
                <select
                  value={newProduct.magasin}
                  onChange={(e) => setNewProduct({...newProduct, magasin: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">Sélectionnez le magasin</option>
                  {enseignes.map(enseigne => (
                    <option key={enseigne.nom} value={enseigne.nom}>
                      {enseigne.nom} - {enseigne.ville} ({enseigne.specialite})
                    </option>
                  ))}
                </select>
              </div>

              {/* Étape 6: Prix */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  6️⃣ Prix *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2.45"
                    value={newProduct.prix}
                    onChange={(e) => setNewProduct({...newProduct, prix: e.target.value})}
                    className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                  <span className="absolute right-4 top-3 text-gray-500 font-medium">€</span>
                </div>
              </div>

              {/* Aperçu du produit */}
              {newProduct.categorie && newProduct.article && newProduct.marque && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <h3 className="font-bold text-green-800 mb-2">📋 Aperçu du produit</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Nom :</span> {newProduct.article} {newProduct.marque} {newProduct.conditionnement}</p>
                    <p><span className="font-medium">Catégorie :</span> {categoriesAlimentaires[newProduct.categorie]?.emoji} {newProduct.categorie}</p>
                    {newProduct.prix && newProduct.magasin && (
                      <p><span className="font-medium">Prix :</span> {newProduct.prix}€ chez {newProduct.magasin}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setSearchProduct('');
                    setNewProduct({
                      categorie: '',
                      article: '',
                      marque: '',
                      conditionnement: '',
                      prix: '',
                      magasin: ''
                    });
                  }}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
                >
                  ➕ Ajouter
                </button>
              </div>

              {/* Info récompense */}
              <div className="text-center text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                🎁 <span className="font-medium">Récompense :</span> +10 points pour chaque produit ajouté !
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout rapide */}
      {showQuickAdd && quickAddProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            {/* Header du modal rapide */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">⚡ Ajout rapide</h2>
                  <p className="text-sm opacity-90">Finalisez l'ajout en 3 clics</p>
                </div>
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    setQuickAddProduct(null);
                  }}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <span className="text-lg">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Produit sélectionné */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{quickAddProduct.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg text-blue-800">{quickAddProduct.nom}</h3>
                    <p className="text-sm text-blue-600">{quickAddProduct.categorie}</p>
                  </div>
                </div>
              </div>

              {/* Formulaire rapide */}
              <div className="space-y-4">
                {/* Marque */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🏷️ Marque *
                  </label>
                  <select
                    id="quickMarque"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Sélectionnez une marque</option>
                    <optgroup label="🏷️ Marques nationales">
                      {marquesAlimentaires["Marques nationales"].slice(0, 10).map(marque => (
                        <option key={marque} value={marque}>{marque}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🛒 Marques distributeur">
                      {Object.entries(marquesAlimentaires["Marques distributeur"]).map(([enseigne, marques]) => 
                        marques.map(marque => (
                          <option key={marque} value={marque}>{marque} ({enseigne})</option>
                        ))
                      )}
                    </optgroup>
                  </select>
                </div>

                {/* Magasin */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🏪 Magasin *
                  </label>
                  <select
                    id="quickMagasin"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Sélectionnez le magasin</option>
                    {enseignes.map(enseigne => (
                      <option key={enseigne.nom} value={enseigne.nom}>
                        {enseigne.nom} - {enseigne.ville}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    💰 Prix unitaire *
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('quickPrix');
                        const value = Math.max(0.01, (parseFloat(input.value) || 0) - 0.10);
                        input.value = value.toFixed(2);
                        // Mettre à jour le prix total
                        const quantite = parseInt(document.getElementById('quickQuantite').value) || 1;
                        const total = value * quantite;
                        document.getElementById('prixTotalPreview').textContent = total.toFixed(2) + ' €';
                      }}
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105"
                    >
                      −
                    </button>
                    <div className="flex-1 relative">
                      <input
                        id="quickPrix"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="999.99"
                        placeholder="Ex: 2.45"
                        onChange={() => {
                          const prix = parseFloat(document.getElementById('quickPrix').value) || 0;
                          const quantite = parseInt(document.getElementById('quickQuantite').value) || 1;
                          const total = prix * quantite;
                          document.getElementById('prixTotalPreview').textContent = total.toFixed(2) + ' €';
                        }}
                        className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg text-center font-bold"
                      />
                      <span className="absolute right-4 top-3 text-gray-500 font-medium">€</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('quickPrix');
                        const value = Math.min(999.99, (parseFloat(input.value) || 0) + 0.10);
                        input.value = value.toFixed(2);
                        // Mettre à jour le prix total
                        const quantite = parseInt(document.getElementById('quickQuantite').value) || 1;
                        const total = value * quantite;
                        document.getElementById('prixTotalPreview').textContent = total.toFixed(2) + ' €';
                      }}
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    💰 Prix par unité/pack (±0,10€ par clic)
                  </p>
                </div>

                {/* Quantité */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📦 Quantité *
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('quickQuantite');
                        const value = Math.max(1, parseInt(input.value || 1) - 1);
                        input.value = value;
                        // Mettre à jour le prix total
                        const prix = parseFloat(document.getElementById('quickPrix').value) || 0;
                        const total = prix * value;
                        document.getElementById('prixTotalPreview').textContent = total.toFixed(2) + ' €';
                      }}
                      className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105"
                    >
                      −
                    </button>
                    <input
                      id="quickQuantite"
                      type="number"
                      min="1"
                      max="99"
                      defaultValue={quickAddProduct?.quantiteDetectee || 1}
                      onChange={() => {
                        const prix = parseFloat(document.getElementById('quickPrix').value) || 0;
                        const quantite = parseInt(document.getElementById('quickQuantite').value) || 1;
                        const total = prix * quantite;
                        document.getElementById('prixTotalPreview').textContent = total.toFixed(2) + ' €';
                      }}
                      className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('quickQuantite');
                        const value = Math.min(99, parseInt(input.value || 1) + 1);
                        input.value = value;
                        // Mettre à jour le prix total
                        const prix = parseFloat(document.getElementById('quickPrix').value) || 0;
                        const total = prix * value;
                        document.getElementById('prixTotalPreview').textContent = total.toFixed(2) + ' €';
                      }}
                      className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    🛒 Nombre d'unités/packs achetés
                  </p>
                </div>

                {/* Aperçu prix total */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="text-center">
                    <p className="text-sm text-green-700 font-medium mb-1">💰 Prix total estimé</p>
                    <p id="prixTotalPreview" className="text-2xl font-bold text-green-800">0,00 €</p>
                    <p className="text-xs text-green-600">Prix unitaire × Quantité</p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowQuickAdd(false);
                    setQuickAddProduct(null);
                  }}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const prix = document.getElementById('quickPrix').value;
                    const magasin = document.getElementById('quickMagasin').value;
                    const marque = document.getElementById('quickMarque').value;
                    const quantite = document.getElementById('quickQuantite').value;
                    handleQuickAdd(prix, magasin, marque, quantite);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
                >
                  ⚡ Ajouter rapidement
                </button>
              </div>

              {/* Info récompense */}
              <div className="text-center text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-4">
                🎁 <span className="font-medium">+10 points</span> pour cet ajout rapide !
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scan973App;
