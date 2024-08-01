document.addEventListener('DOMContentLoaded', function() {
    var quill = new Quill('#content', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean'],
                ['hr']
            ]
        },
        placeholder: 'Compose an epic...',
        readOnly: false,
        bounds: '#content',
        scrollingContainer: '#content'
    });
});

document.getElementById('addAuthor').addEventListener('click', function() {
    const authorFields = document.querySelector('.author-fields');
    const newAuthorField = document.createElement('div');
    newAuthorField.innerHTML = `
        <input type="text" name="authorName" placeholder="Name">
        <input type="text" name="authorAffiliation" placeholder="Affiliation">
    `;
    authorFields.appendChild(newAuthorField);
});

document.getElementById('addRelatedArticle').addEventListener('click', function() {
    const relatedArticlesFields = document.querySelector('.related-articles-fields');
    const newRelatedArticleField = document.createElement('div');
    newRelatedArticleField.innerHTML = `
        <input type="text" name="relatedArticleTitle" placeholder="Title">
        <input type="text" name="relatedArticleDOI" placeholder="DOI">
    `;
    relatedArticlesFields.appendChild(newRelatedArticleField);
});

document.getElementById('addDocumentAuthor').addEventListener('click', function() {
    const documentAuthorFields = document.querySelector('.document-author-fields');
    const newDocumentAuthorField = document.createElement('div');
    newDocumentAuthorField.innerHTML = `
        <input type="text" name="documentAuthorName" placeholder="Name">
        <input type="text" name="documentAuthorAffiliation" placeholder="Affiliation">
    `;
    documentAuthorFields.appendChild(newDocumentAuthorField);
});

document.getElementById('exportMarkdown').addEventListener('click', function() {
    const form = document.getElementById('articleForm');
    const formData = new FormData(form);
    let markdownContent = `---
title: "${formData.get('title')}"
authors:
`;

    const authorFields = document.querySelectorAll('.author-fields input[name="authorName"]');
    authorFields.forEach(field => {
        const name = field.value;
        const affiliation = field.nextElementSibling.value;
        markdownContent += `  - name: "${name}"
    affiliation: "${affiliation}"
`;
    });

    markdownContent += `journal: "${formData.get('journal')}"
pages: "${formData.get('pages')}"
year: ${formData.get('year')}
doi: "${formData.get('doi')}"
keywords:
  - "${formData.get('keywords')}"
abstract: "${formData.get('abstract')}"
sentiment: "${formData.get('sentiment')}"
ideology: "${formData.get('ideology')}"
philosophical_views: "${formData.get('philosophical_views')}"
thought_streams:
  - "${formData.get('thought_streams')}"
study_fields:
  - "${formData.get('study_fields')}"
related_articles:
`;

    const relatedArticleFields = document.querySelectorAll('.related-articles-fields input[name="relatedArticleTitle"]');
    relatedArticleFields.forEach(field => {
        const title = field.value;
        const doi = field.nextElementSibling.value;
        markdownContent += `  - title: "${title}"
    doi: "${doi}"
`;
    });

    markdownContent += `document_type: "${formData.get('document_type')}"
document_authors:
`;

    const documentAuthorFields = document.querySelectorAll('.document-author-fields input[name="documentAuthorName"]');
    documentAuthorFields.forEach(field => {
        const name = field.value;
        const affiliation = field.nextElementSibling.value;
        markdownContent += `  - name: "${name}"
    affiliation: "${affiliation}"
`;
    });

    markdownContent += `---

${document.querySelector('.ql-editor').innerHTML}`;

    const blob = new Blob([markdownContent], {type: 'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const title = formData.get('title').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `${title}.md`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});