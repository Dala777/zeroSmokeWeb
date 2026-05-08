package com.zerosmoke.stepdefinitions;

import com.zerosmoke.pages.HomePage;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import net.serenitybdd.annotations.Steps;

public class CommonSteps {

    @Steps
    HomePage homePage;

    @Given("que la aplicación ZeroSmoke está funcionando")
    public void quelaAplicacionZeroSmokeEstaFuncionando() {
        homePage.openHomePage();
    }

    @And("estoy en la página principal")
    public void estoyEnLaPaginaPrincipal() {
        // Verificar que estamos en la página principal
        homePage.waitForPageToLoad();
    }
}
