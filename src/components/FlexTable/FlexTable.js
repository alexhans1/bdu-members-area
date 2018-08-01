import React, { Component } from 'react';
import './FlexTable.css';

class FlexTable extends Component {
  render() {
    const { tableName, headColumns, bodyRows, striped, hover, collapse } = this.props;
    let tableClass = '';
    if (collapse) tableClass += ' cursorPointer';
    if (striped) tableClass += ' flex-table-striped';
    if (hover) tableClass += ' flex-table-hover';
    if (!headColumns) tableClass += ' flex-table-columnHead';
    return (
      <div key={tableName} className="flex-table">
        {headColumns ? (
          <div className="flex-table-row flex-table-head">
            {headColumns.map((headColumn, index) => (
              <div key={`HeadRow_${index}`} className="flex-table-cell">
                <div>
                  {headColumn}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {bodyRows.map((bodyRow, rowIndex) => (
          <div key={`BodyRow_${rowIndex}`} className={tableClass}
               data-toggle={collapse ? 'collapse' : ''} data-target={collapse ? `#rowCollapse_${rowIndex}` : ''}>
            <div className="flex-table-row">
              {bodyRow.map((column, columnIndex) => (
                <div key={`BodyColumn_${columnIndex}`} className="flex-table-cell">
                  {column}
                </div>
              ))}
            </div>
            {collapse ? (
              <div id={`rowCollapse_${rowIndex}`} className="collapse">
                <div className="w-100">
                  {collapse[rowIndex]}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }
}

export default FlexTable;
