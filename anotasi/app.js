document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const contentArea = document.getElementById('contentArea');
    const exportButton = document.getElementById('exportButton');
    const fileButton = document.getElementById('fileButton');
    const entityButtons = document.querySelectorAll('.entity-button');
    const entityList = document.getElementById('entityList');

    // Initialize entities object with all possible entity types
    let entities = {
        title: [],
        author: [],
        date_of_publication: [],
        publisher: [],
        location: [],
        person: [],
        organization: [],
        keyword: [],
        key_point: [],
        quotation: []
    };

    // Variable to store the selected entity type
    let selectedEntity = null;

    // Event listeners
    fileButton.addEventListener('click', () => {
        fileInput.click(); // Trigger file input dialog
    });

    fileInput.addEventListener('change', handleFileUpload);
    exportButton.addEventListener('click', exportMarkdown);
    entityButtons.forEach(button => {
        button.addEventListener('click', handleEntityClick);
    });
    contentArea.addEventListener('mouseup', handleTextSelection);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const [frontmatter, markdownContent] = parseMarkdown(content);
                parseYAMLFrontmatter(frontmatter);
                contentArea.value = markdownContent;
            };
            reader.readAsText(file);
        }
    }

    function handleEntityClick(event) {
        selectedEntity = event.target.dataset.entity;
        if (selectedEntity) {
            annotateSelection(selectedEntity);
        } else {
            console.error('Entity data attribute is missing or invalid.');
        }
    }

    function handleTextSelection() {
        const selection = window.getSelection();
        if (selection.toString().trim() && selectedEntity) {
            annotateSelection(selectedEntity);
        }
    }

    function annotateSelection(entity) {
        if (entities.hasOwnProperty(entity)) {
            const selection = window.getSelection();
            if (selection.toString().trim()) {
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.className = 'annotation';
                span.dataset.entity = entity;
                span.textContent = selection.toString();
                range.deleteContents();
                range.insertNode(span);
                addToEntityList(entity, selection.toString());

                // Reset the selected entity after annotation
                selectedEntity = null;
            }
        } else {
            console.error('Invalid entity:', entity);
        }
    }

    function addToEntityList(entity, text) {
        if (!entities[entity]) {
            entities[entity] = [];
        }
        entities[entity].push({ text, id: createUniqueId() });
        updateEntityList();
    }

    function updateEntityList() {
        entityList.innerHTML = '';
        const orderedEntities = ['title', 'author', 'date_of_publication', 'publisher', 'location', 'person', 'organization', 'keyword', 'key_point', 'quotation'];
    
        orderedEntities.forEach(entity => {
            const values = entities[entity] || [];
            const entityText = values.map(value => `"${value.text}"`).join(', '); // Comma-separated values
    
            const li = document.createElement('li');
            li.className = 'entity-item';
    
            const entityName = document.createElement('span');
            entityName.className = 'entity-key';
            entityName.textContent = `${entity}: `;
    
            const entityValues = document.createElement('span');
            entityValues.className = 'entity-value';
            entityValues.textContent = entityText || '""'; // Empty quotes if no value
    
            li.appendChild(entityName);
            li.appendChild(entityValues);
            entityList.appendChild(li);
        });
    }
    

    function editEntity(entity, id) {
        const newText = prompt('Edit the annotation:', entities[entity].find(v => v.id === id).text);
        if (newText) {
            const value = entities[entity].find(v => v.id === id);
            value.text = newText;
            updateEntityList();
        }
    }

    function deleteEntity(entity, id) {
        if (confirm(`Are you sure you want to delete this annotation?`)) {
            entities[entity] = entities[entity].filter(v => v.id !== id);
            if (entities[entity].length === 0) {
                delete entities[entity];
            }
            updateEntityList();
        }
    }

    function exportMarkdown() {
        let yamlContent = "---\n";
        const orderedEntities = ['title', 'author', 'date_of_publication', 'publisher', 'location', 'person', 'organization', 'keyword', 'key_point', 'quotation'];
    
        orderedEntities.forEach(entity => {
            const values = entities[entity] || [];
            const entityText = values.map(value => `"${value.text}"`).join(', ');
            yamlContent += `${entity}: [${entityText}]\n`; // Comma-separated in square brackets
        });
    
        yamlContent += "---\n";
    
        const markdownContent = contentArea.value;
        const markdown = yamlContent + markdownContent;
        downloadFile(markdown, 'annotated.md', 'text/markdown');
    }
    

    function downloadFile(content, fileName, mimeType) {
        const a = document.createElement('a');
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    }

    function parseMarkdown(content) {
        const frontmatterEnd = content.indexOf('---', 3);
        if (frontmatterEnd !== -1) {
            const frontmatter = content.substring(0, frontmatterEnd + 3);
            const markdownContent = content.substring(frontmatterEnd + 3);
            return [frontmatter, markdownContent];
        }
        return ['', content]; // Handle cases without frontmatter
    }

    function parseYAMLFrontmatter(frontmatter) {
        try {
            const doc = jsyaml.load(frontmatter);
            if (doc) {
                Object.keys(doc).forEach(key => {
                    if (entities.hasOwnProperty(key)) {
                        entities[key] = doc[key].map(value => ({
                            text: value,
                            id: createUniqueId()
                        }));
                    }
                });
            }
        } catch (e) {
            console.error('Error parsing YAML frontmatter:', e);
        }
    }

    function createUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
});
