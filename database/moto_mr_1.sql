-- ============================================================
-- MODELO ENTIDAD - RELACION: MOTO MR
-- Script de creacion de base de datos y tablas
-- ============================================================

CREATE DATABASE IF NOT EXISTS moto_mr;
USE moto_mr;

-- ------------------------------------------------------------
-- Tabla: USUARIO
-- Quien utiliza el sistema
-- ------------------------------------------------------------
CREATE TABLE USUARIO (
    ID_Usuario   INT AUTO_INCREMENT PRIMARY KEY,
    Nombre       VARCHAR(100) NOT NULL,
    Correo       VARCHAR(150) NOT NULL UNIQUE,
    Contrasena   VARCHAR(255) NOT NULL
);

-- ------------------------------------------------------------
-- Tabla: CLIENTE
-- Persona que realiza compras
-- ------------------------------------------------------------
CREATE TABLE CLIENTE (
    ID_Cliente   INT AUTO_INCREMENT PRIMARY KEY,
    Nombre       VARCHAR(100) NOT NULL,
    Telefono     VARCHAR(20),
    Correo       VARCHAR(150)
);

-- ------------------------------------------------------------
-- Tabla: PRODUCTO
-- Articulos que se venden en Moto MR
-- ------------------------------------------------------------
CREATE TABLE PRODUCTO (
    ID_Producto  INT AUTO_INCREMENT PRIMARY KEY,
    Nombre       VARCHAR(150) NOT NULL,
    Precio       DECIMAL(10,2) NOT NULL,
    Stock        INT NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Tabla: VENTA
-- Registro de cada compra realizada
-- Relaciones REALIZA: Usuario (1:N) y Cliente (1:N)
-- ------------------------------------------------------------
CREATE TABLE VENTA (
    ID_Venta     INT AUTO_INCREMENT PRIMARY KEY,
    Fecha        DATE NOT NULL,
    Total        DECIMAL(10,2) NOT NULL,
    Metodo_Pago  VARCHAR(50) NOT NULL,
    ID_Usuario   INT NOT NULL,
    ID_Cliente   INT NOT NULL,
    CONSTRAINT fk_venta_usuario
        FOREIGN KEY (ID_Usuario) REFERENCES USUARIO(ID_Usuario),
    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (ID_Cliente) REFERENCES CLIENTE(ID_Cliente)
);

-- ------------------------------------------------------------
-- Tabla: CONTIENE (tabla intermedia Venta - Producto)
-- Una venta puede contener varios productos y un producto
-- puede estar en muchas ventas (relacion N:N)
-- ------------------------------------------------------------
CREATE TABLE CONTIENE (
    ID_Venta     INT NOT NULL,
    ID_Producto  INT NOT NULL,
    Cantidad     INT NOT NULL DEFAULT 1,
    PRIMARY KEY (ID_Venta, ID_Producto),
    CONSTRAINT fk_contiene_venta
        FOREIGN KEY (ID_Venta) REFERENCES VENTA(ID_Venta),
    CONSTRAINT fk_contiene_producto
        FOREIGN KEY (ID_Producto) REFERENCES PRODUCTO(ID_Producto)
);
