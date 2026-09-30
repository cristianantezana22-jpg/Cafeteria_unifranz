package com.cafeteria.cafeteria_unifranz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(excludeName = {
    "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration",
    "org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration",
    "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration",
    "org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration"
})
public class CafeteriaUnifranzApplication {

    public static void main(String[] args) {
        SpringApplication.run(CafeteriaUnifranzApplication.class, args);
    }

}