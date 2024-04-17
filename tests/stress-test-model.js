const basePagesPath = "http://localhost:8000/pages/";

const pageLoader = {
    walletGridContent: `${basePagesPath}Wallet/wallet-content-grid.html`,
    walletListContent: `${basePagesPath}Wallet/wallet-content-list.html`,
    leftMenu: `${basePagesPath}Wallet/left-menu.html`,
    rightMenu: `${basePagesPath}Wallet/right-menu.html`,
    walletContent: `${basePagesPath}Wallet/wallet-content.html`,
    switchLayout: `${basePagesPath}Wallet/switch-layout.html`,
    signOut: `${basePagesPath}Wallet/sign-out.html`,
    signOutModal: `${basePagesPath}Wallet/modals/sign-out-modal.html`,
    fileDossierModals: `${basePagesPath}Wallet/modals/file-dossier-modals.html`,
    createDossierModal: `${basePagesPath}Wallet/modals/new-dossier-modal.html`,
    importDossierModal: `${basePagesPath}Wallet/modals/import-dossier-modal.html`,
    receiveDossierModal: `${basePagesPath}Wallet/modals/receive-dossier-modal.html`
};

const createDossierModal = {
    title: "Create Dossier",
    createState: true,
    hasError: false,
    errorMessage: "",
    setNameInput: {
        label: "Name your new dossier",
        value: ""
    },
    seedInput: {
        label: "Dossier with the SEED below has been successfully created!",
        value: "ep8n5buype895ubye8netpmtu9rutepu9teertue58yuet7iy7tijht",
        readOnly: true
    },
    setNameButton: {
        disabled: true,
        label: "Create Dossier",
        eventName: "name-new-dossier",
        buttonClass: "btn-confirm-primary"
    },
    finishButton: {
        label: "Finish",
        eventName: "new-dossier-seed-received",
        buttonClass: "btn-confirm-primary"
    }
};

const importDossierModal = {
    title: "Import Dossier",
    createState: true,
    hasError: false,
    errorMessage: "",
    setNameInput: {
        label: "Name the imported dossier",
        value: ""
    },
    setSeedInput: {
        label: "Enter your SEED",
        value: ""
    },
    setNameButton: {
        disabled: true,
        label: "Continue",
        eventName: "name-import-dossier",
        buttonClass: "btn-confirm-primary"
    },
    finishButton: {
        label: "Finish",
        eventName: "seed-import-dossier",
        buttonClass: "btn-confirm-primary"
    }
};

const receiveDossierModal = {
    title: "Receive Dossier",
    disclaimer:
        "Once the colaborator sends you the Dossier SEED you can scan the QRcode or enter the URL. After that you will be prompted to choose a place and a name for the new Dossier",
    orLabel: "or",
    createState: true,
    hasError: false,
    errorMessage: "",
    receiveCode: {
        readOnly: true,
        value: "%rt78qtp%$"
    },
    setNameInput: {
        label: "Dossier name",
        value: ""
    },
    selectDestination: {
        label: "Dossier destination",
        value: "",
        selectOptions: "Wallet root, / | Data, /data | New Dossier, /new-dossier"
    },
    nextButton: {
        label: "Next",
        eventName: "next-receive-dossier",
        buttonClass: "btn-confirm-primary"
    },
    finishButton: {
        label: "Finish",
        eventName: "finish-receive-dossier",
        buttonClass: "btn-confirm-primary"
    }
};

const addItems = {
    selectedModal: "",
    closeModal: "add-modal",
    addButton: {
        label: "Add",
        icon: "plus",
        iconColor: "#ffffff",
        classes: "add-menu"
    },
    addButtonsList: [
        {
            label: "Add file",
            eventName: "add-modal",
            eventData: '{ "path": "/", "modalName": "add-file" }',
            buttonClass: "btn-menu"
        },
        {
            label: "Add folder",
            eventName: "add-modal",
            eventData: '{ "path": "/", "modalName": "add-folder" }',
            buttonClass: "btn-menu bottom-border"
        },
        {
            label: "Create Dossier",
            eventName: "add-modal",
            eventData: '{ "path": "/", "modalName": "create-dossier" }',
            buttonClass: "btn-menu"
        },
        {
            label: "Import Dossier",
            eventName: "add-modal",
            eventData: '{ "path": "/", "modalName": "import-dossier" }',
            buttonClass: "btn-menu"
        },
        {
            label: "Receive Dossier",
            eventName: "add-modal",
            eventData: '{ "path": "/", "modalName": "receive-dossier" }',
            buttonClass: "btn-menu"
        }
    ]
};

const rightMenu = {
    dotsMenu: {
        icon: "ellipsis-v",
        iconColor: "#572a57",
        classes: "dots-menu"
    },
    menuActions: [
        {
            label: "Move",
            eventName: "right-menu-move",
            eventData: '{"path": "/"}',
            buttonClass: "btn-menu"
        },
        {
            label: "Rename",
            eventName: "right-menu-rename",
            eventData: '{"path": "/"}',
            buttonClass: "btn-menu"
        }
    ],
    viewIcon: {
        icon: "eye",
        iconColor: "#572a57",
        iconClass: "right-menu",
        eventData: '{"path": "/"}',
        eventName: "right-menu-view",
        buttonClass: "no-btn"
    },
    exportIcon: {
        icon: "download",
        iconColor: "#572a57",
        iconClass: "right-menu",
        eventData: '{"path": "/"}',
        eventName: "right-menu-export",
        buttonClass: "no-btn"
    },
    shareIcon: {
        icon: "share",
        iconColor: "#572a57",
        iconClass: "right-menu",
        eventData: '{"path": "/"}',
        eventName: "right-menu-share",
        buttonClass: "no-btn"
    },
    deleteIcon: {
        icon: "trash",
        iconColor: "#572a57",
        iconClass: "right-menu",
        eventData: '{"path": "/"}',
        eventName: "right-menu-delete",
        buttonClass: "no-btn"
    }
};

const switchLayout = {
    grid: {
        icon: "th",
        iconColor: "#572a57",
        iconClass: "right-menu",
        switchHover: "Click to switch to list",
        eventName: "switch-layout"
    },
    list: {
        icon: "th-list",
        iconColor: "#572a57",
        iconClass: "right-menu",
        switchHover: "Click to switch to grid",
        eventName: "switch-layout"
    },
    active: "grid",
    buttonClass: "btn-switch"
};

const pagination = {
    loadMore: "Load more"
};

const dossierDetails = {
    sizeLabel: "Size",
    typeLabel: "Type",
    lastModificationLabel: "Last modification",
    nameLabel: "Name",
    selected: [],
    noItemsLabel:
        "There are no items in the current folder/dossier. You can add some by using the Add button.",
    items: [
        {
            name: "assets",
            lastModification: "1584079000",
            type: "folder",
            iconColor: "#572a57",
            gridIcon: "folder",
            size: "78563"
        },
        {
            name: "blockchain",
            lastModification: "547856365631313213132132132131",
            type: "file",
            iconColor: "#572a57",
            gridIcon: "file",
            size: "547856365631313213132132132131"
        },
        {
            name: "app",
            lastModification: "1584079000",
            type: "application",
            size: "2478563",
            iconColor: "#572a57",
            gridIcon: "cog",
            action: {
                buttonClass: "btn-run",
                label: "Run",
                eventName: "run-app",
                iconColor: "#572a57",
                icon: "play",
                iconClass: "icon-run-app"
            }
        },
        {
            name: "New Dossier",
            lastModification: "1584079000",
            size: "347856",
            type: "dossier",
            icon: "lock",
            iconColor: "#572a57",
            gridIcon: "lock"
        }
    ]
};

const signOut = {
    eventName: "exit",
    buttonClass: "btn-exit",
    icon: "sign-out",
    iconColor: "#572a57",
    iconClass: "right-menu",
    label: "Exit",
    modal: {
        opened: false,
        title: "Exit Wallet",
        confirmQuestion:
            "Would you also like to delete Walled SEED from this device?",
        checkbox: {
            checked: false,
            checkboxLabel: "I have a copy of this Wallet SEED",
            value: "unchecked"
        },
        confirmButton: {
            disabled: true,
            label: "Yes",
            eventName: "confirm-exit",
            buttonClass: "btn-confirm"
        },
        justExitButton: {
            label: "No, just exit",
            eventName: "confirm-exit",
            buttonClass: "btn-confirm-primary"
        },
        error: {
            hasError: true,
            errorMessage: "Service error"
        }
    }
};

module.exports = explorerModel = {
    sectionTitle: "Dashboard",
    pageLoader: {...pageLoader},
    signOut: {...signOut},
    addItems: {...addItems},
    rightMenu: {...rightMenu},
    dossierDetails: {...dossierDetails},
    switchLayout: {...switchLayout},
    pagination: {...pagination},
    createDossierModal: {...createDossierModal},
    importDossierModal: {...importDossierModal},
    receiveDossierModal: {...receiveDossierModal}
};
