package com.fintech.simdocfinder.parser;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
@Slf4j
public class ExcelParser {

    public String parse(InputStream inputStream) {
        log.info("Parsing Excel workbook");
        DataFormatter formatter = new DataFormatter();
        StringBuilder sb = new StringBuilder();

        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            for (Sheet sheet : workbook) {
                sb.append("Sheet: ").append(sheet.getSheetName()).append("\n");

                for (Row row : sheet) {
                    for (int cellIndex = 0; cellIndex < row.getLastCellNum(); cellIndex++) {
                        if (cellIndex > 0) {
                            sb.append(" | ");
                        }
                        sb.append(formatter.formatCellValue(row.getCell(cellIndex)));
                    }
                    sb.append("\n");
                }

                sb.append("\n");
            }

            log.info("Successfully parsed Excel workbook");
            return sb.toString();
        } catch (Exception e) {
            log.error("Failed to parse Excel workbook", e);
            throw new RuntimeException("Excel parsing failed", e);
        }
    }
}
