const fixture = require('../../scripts/fixture.js');
const startServer = require('../../server/src/index.js');
const BookModels = require('../../server/src/models/book.js');

let BASE_URL;
let server;

before(async (browser, done) => {
    server = await startServer();

    BASE_URL = `http://localhost:${server.address().port}`;
    done();
});

beforeEach(async (browser, done) => {
    await BookModels.Book.sync({ force: true });
    await fixture.initBooks();
    done();
});

after(() => {
    server.close();
});

describe('Home Test', () => {

    test('Deberia mostrar la cantidad de libros correspondiente al filtro aplicado en la etiqueda de Cantidad de libros', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]')
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]')
            .click('.book__actions [data-ref=addToFinish]')
            .pause(400)
            .waitForElementVisible(
                '.book__actions [data-ref=removeFromFinish]');
        
        browser
            .url(BASE_URL)
            .click('body > main > div > div.filters-container > form > label:nth-child(3) > div')
            .waitForElementVisible('#cant > strong');
           
        browser.expect
            .element('#cant > strong')
            .text.to.equal('1');
        });

    
    test('Deberia tener de titulo Bookli', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .assert.titleContains('Bookli');
    });

    test('Deberia mostrar el logo de Bookli', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.brand__logo')
            .assert.attributeContains(
                '.brand__logo',
                'src',
                '/assets/logo.svg'
            );
    });

    test('Deberia mostrar la lista de libros', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .assert.elementPresent('.booklist .book');
    });

    test('Deberia poder encontrar un libro por titulo', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('Operaci')
            .pause(400)
            .expect.elements('.booklist .book')
            .count.to.equal(1);
    });

    test('Deberia mostrar un mensaje cuando no se encuentra un libro', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('No existe')
            .pause(400);

        browser.expect.elements('.booklist .book').count.to.equal(0);
        browser.expect
            .element('.booklist.booklist--empty p')
            .text.to.equal(
                'Hmmm... Parece que no tenemos el libro que buscas.\nProba con otra busqueda.'
            );
    });
});

describe('Detail view', () => {
    test('Deberia mostrar boton para agregar a lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser.expect
            .element('.book__actions [data-ref=addToList]')
            .text.to.equal('Empezar a leer');
    });

    test('Deberia mostrar boton para remover libro de la lista de lectura si el libro es parte de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(1000)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');
    });

    test('Deberia poder remover libro de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');

        browser
            .click('.book__actions [data-ref=removeFromList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser.expect
            .element('.book__actions [data-ref=addToList]')
            .text.to.equal('Empezar a leer');
    });

    test('Deberia poder finalizar un libro de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=addToFinish]')
            .text.to.equal('Lo termine!');

        browser
            .click('.book__actions [data-ref=addToFinish]')
            .pause(400)
            .waitForElementVisible(
                '.book__actions [data-ref=removeFromFinish]'
            );

        browser.expect
            .element('.book__actions [data-ref=removeFromFinish]')
            .text.to.equal('Volver a leer');
    });







    test('Deberia testear que el input de búsqueda tenga placeholder', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.search__input')
            .assert.attributeContains('.search__input',
                                      'placeholder',
                                      'Buscar un libro')
    });


    
    test('Al hacer click en el boton Atras, deberia redireccionar a la pagina principal', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('body > main > div > input[type=button]')
            .click('body > main > div > input[type=button]')
            .pause(400)
            .assert.urlEquals(BASE_URL+'/');
        
    });

    test('Deberia testear que al pasar el mouse por una card de libros disponibles, se agregue opacity en esa card y se pone en negrita todo el texto de la card', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.book')
            .moveToElement ('body > main > div > div.books-container > div > a:nth-child(1) > div > div.book__cover',
                                        10,
                                        10,)
            .assert.cssProperty('body > main > div > div.books-container > div > a:nth-child(1) > div > div.book__cover',
                                      'opacity',
                                      '0.8')
            .assert.cssProperty('body > main > div > div.books-container > div > a:nth-child(1) > div > div.book__cover',
            'font-weight',
            '700')               

    });

    
  
    test('Deberia volver a la pantalla principal cuando apreto en el logo', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('opera')
            .click('.book')
            .pause(400)
            .click('.brand__logo');
            browser.expect
                .url().equal(BASE_URL+'/');
        
    });

});





