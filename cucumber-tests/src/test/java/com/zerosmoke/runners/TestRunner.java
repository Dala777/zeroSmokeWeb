package com.zerosmoke.runners;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
        features = "src/test/resources/features",
        glue = "com.zerosmoke.stepdefinitions",
        plugin = {"pretty", "html:target/cucumber-reports"},
        tags = "not @ignore"
)
public class TestRunner {
}
