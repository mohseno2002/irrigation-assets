/**
 * API مزامنة تطبيق «إدارات قطاع الري».
 * انشر الملف كتطبيق ويب يعمل باسم مالك الورقة.
 */
const SPREADSHEET_ID = "1ZoP79UM9ECQoUNb-Q5L3HILGxOQQi9mtZXeM6rM0RM4";
const API_VERSION = 1;
const CHANGES_SHEET = "التحديثات";
const AUDIT_SHEET = "سجل_المراجعة";
const CHANGE_HEADERS = [
  "change_id", "record_id", "operation", "entity_type", "payload_json",
  "base_version", "version", "updated_at", "updated_by", "device_id",
  "deleted", "checksum",
];
const AUDIT_HEADERS = [
  "audit_id", "change_id", "action", "record_id", "payload_json", "timestamp",
  "user", "device_id", "status", "server_version", "message", "entity_type",
];
const ENTITY_DEFINITIONS = {
  vehicle_equipment: {
    sheet: "السيارات_والمعدات", required: ["adm", "assetName", "assetType"],
    fields: [
      ["adm", "الإدارة"], ["assetName", "اسم أو وصف السيارة/المعدة"], ["assetType", "نوع الأصل"], ["fleetNumber", "رقم الأسطول أو العهدة"],
      ["eng", "الهندسة أو الوحدة"], ["workLocation", "موقع العمل"], ["plateNumber", "رقم اللوحات"], ["chassisNumber", "رقم الشاسيه"],
      ["engineNumber", "رقم المحرك"], ["manufacturer", "الماركة أو الشركة المصنعة"], ["model", "الموديل"], ["manufactureYear", "سنة الصنع", "number", 1900, 2200],
      ["ownershipType", "نوع الحيازة"], ["fuelType", "نوع الوقود أو الطاقة"], ["powerOrCapacity", "القدرة أو الحمولة"],
      ["odometerKm", "عداد المسافة كم", "number"], ["operatingHours", "ساعات التشغيل", "number"], ["custodian", "السائق أو مسؤول العهدة"],
      ["licenseNumber", "رقم الترخيص"], ["licenseExpiry", "انتهاء الترخيص", "date"], ["insuranceExpiry", "انتهاء التأمين", "date"],
      ["lastMaintenanceDate", "آخر صيانة", "date"], ["nextMaintenanceDate", "الصيانة القادمة", "date"],
      ["technicalCondition", "الحالة الفنية"], ["status", "الحالة التشغيلية"],
      ["latitude", "دائرة العرض", "number", -90, 90], ["longitude", "خط الطول", "number", -180, 180],
      ["documentUrl", "رابط المستند أو الصور"], ["notes", "ملاحظات"],
    ],
  },
  coverage: {
    sheet: "التغطيات", required: ["adm", "coverageName", "canalName", "eng"],
    fields: [
      ["adm", "الإدارة"], ["coverageName", "اسم أو وصف التغطية"], ["canalName", "الترعة أو المجرى"], ["eng", "الهندسة"],
      ["startKm", "من كم", "number"], ["endKm", "إلى كم", "number"], ["lengthM", "الطول م", "number"], ["widthM", "العرض أو الفتحة م", "number"],
      ["coverageType", "نوع التغطية"], ["purpose", "الغرض"], ["material", "المادة الإنشائية"], ["executionYear", "سنة التنفيذ", "number", 1900, 2200],
      ["structuralCondition", "الحالة الإنشائية"], ["status", "الحالة التشغيلية"], ["lastInspectionDate", "تاريخ آخر معاينة", "date"],
      ["latitude", "دائرة العرض", "number", -90, 90], ["longitude", "خط الطول", "number", -180, 180],
      ["documentUrl", "رابط المستند أو الصور"], ["notes", "ملاحظات"],
    ],
  },
  property: {
    sheet: "الأملاك", required: ["adm", "propertyNumber", "propertyType", "locationDescription"],
    fields: [
      ["adm", "الإدارة"], ["propertyNumber", "رقم سجل الملكية"], ["propertyType", "نوع الأصل"],
      ["eng", "الهندسة"], ["canal", "الترعة"], ["locationDescription", "وصف الموقع"],
      ["areaSqm", "المساحة م2", "number"], ["areaFeddan", "المساحة فدان", "number"],
      ["deedNumber", "رقم سند الملكية أو التخصيص"], ["currentUse", "الاستخدام الحالي"],
      ["occupant", "الشاغل أو المنتفع"], ["legalStatus", "الموقف القانوني"],
      ["encroachmentStatus", "موقف التعدي"], ["estimatedValue", "القيمة التقديرية", "number"],
      ["latitude", "دائرة العرض", "number", -90, 90], ["longitude", "خط الطول", "number", -180, 180],
      ["documentUrl", "رابط المستند"], ["notes", "ملاحظات"],
    ],
  },
  asset: {
    sheet: "المنشآت_المحدثة",
    required: ["adm", "eng", "canal", "name"],
    fields: [
      ["adm", "الإدارة"], ["eng", "الهندسة"], ["canal", "الترعة"], ["gov", "المحافظة"],
      ["type", "النوع"], ["use", "الاستخدام"], ["material", "المادة"], ["name", "اسم المنشأة"],
      ["km", "الكيلومتر", "number"], ["length", "الطول م", "number"], ["width", "العرض م", "number"],
      ["lon", "خط الطول", "number", -180, 180], ["lat", "دائرة العرض", "number", -90, 90],
    ],
  },
  canal_profile: {
    sheet: "أورنيك_الترع", required: ["adm", "canalName"],
    fields: [
      ["adm", "الإدارة"], ["canalName", "اسم الترعة"], ["canalCode", "كود الترعة"], ["eng", "الهندسة"],
      ["canalClass", "التصنيف"], ["sourceCanal", "المصدر"], ["startKm", "من كم", "number"], ["endKm", "إلى كم", "number"],
      ["lengthKm", "الطول كم", "number"], ["designDischarge", "التصرف التصميمي م3/ث", "number"], ["currentDischarge", "التصرف الحالي م3/ث", "number"],
      ["bedWidthDesign", "عرض القاع التصميمي م", "number"], ["bedWidthCurrent", "عرض القاع الحالي م", "number"],
      ["bedLevelStart", "منسوب القاع بالبداية", "number", -100, 1000], ["bedLevelEnd", "منسوب القاع بالنهاية", "number", -100, 1000],
      ["waterLevelUpstream", "منسوب المياه أمام الفم", "number", -100, 1000], ["waterLevelDownstream", "منسوب المياه بالنهاية", "number", -100, 1000],
      ["bankLevelRight", "منسوب الجسر الأيمن", "number", -100, 1000], ["bankLevelLeft", "منسوب الجسر الأيسر", "number", -100, 1000],
      ["commandAreaFeddan", "الزمام فدان", "number"], ["servedVillages", "المناطق المخدومة"], ["liningStatus", "موقف التبطين"],
      ["linedLengthKm", "الطول المبطن كم", "number"], ["operationalStatus", "الحالة التشغيلية"], ["lastDredgingDate", "آخر تطهير", "date"],
      ["maintenancePriority", "أولوية الصيانة"], ["latitude", "دائرة العرض", "number", -90, 90], ["longitude", "خط الطول", "number", -180, 180], ["notes", "ملاحظات"],
    ],
  },
  license: {
    sheet: "التراخيص", required: ["adm", "licenseNumber", "licenseType", "licenseeName"],
    fields: [
      ["adm", "الإدارة"], ["licenseNumber", "رقم الترخيص"], ["licenseType", "نوع الترخيص"], ["licenseeName", "المرخص له"],
      ["eng", "الهندسة"], ["canal", "الترعة"], ["km", "الكيلومتر", "number"], ["bank", "الجسر"], ["purpose", "الغرض"],
      ["issueDate", "تاريخ الإصدار", "date"], ["expiryDate", "تاريخ الانتهاء", "date"], ["fee", "الرسوم جنيه", "number"],
      ["status", "الحالة"], ["documentUrl", "رابط المستند"], ["notes", "ملاحظات"],
    ],
  },
  violation: {
    sheet: "محاضر_المخالفات", required: ["adm", "reportNumber", "reportDate", "violationType"],
    fields: [
      ["adm", "الإدارة"], ["reportNumber", "رقم المحضر"], ["reportDate", "تاريخ المحضر", "date"], ["offenderName", "اسم المخالف"],
      ["eng", "الهندسة"], ["canal", "الترعة"], ["km", "الكيلومتر", "number"], ["bank", "الموقع"], ["violationType", "نوع المخالفة"],
      ["description", "الوصف"], ["area", "المساحة أو الأبعاد"], ["inspector", "محرر المحضر"], ["legalStatus", "الموقف القانوني"],
      ["estimatedFine", "الغرامة أو مقابل الانتفاع", "number"], ["removalDecisionNo", "قرار الإزالة المرتبط"], ["documentUrl", "رابط المستند"], ["notes", "ملاحظات"],
    ],
  },
  removal_decision: {
    sheet: "قرارات_الإزالة", required: ["adm", "decisionNumber", "decisionDate"],
    fields: [
      ["adm", "الإدارة"], ["decisionNumber", "رقم القرار"], ["decisionDate", "تاريخ القرار", "date"], ["violationReportNo", "رقم المحضر"],
      ["offenderName", "اسم المخالف"], ["eng", "الهندسة"], ["canal", "الترعة"], ["km", "الكيلومتر", "number"],
      ["issuingAuthority", "جهة الإصدار"], ["executionStatus", "موقف التنفيذ"], ["executionDate", "تاريخ التنفيذ", "date"],
      ["executionCost", "تكلفة التنفيذ", "number"], ["policeCoordination", "التنسيق الأمني"], ["remainingWork", "الأعمال المتبقية"],
      ["documentUrl", "رابط المستند"], ["notes", "ملاحظات"],
    ],
  },
  human_resource: {
    sheet: "الموارد_البشرية", required: ["adm", "employeeCode", "employeeName"],
    fields: [
      ["adm", "الإدارة"], ["employeeCode", "الكود الوظيفي"], ["employeeName", "اسم الموظف"], ["jobTitle", "المسمى الوظيفي"],
      ["grade", "الدرجة"], ["specialization", "التخصص"], ["eng", "الهندسة"], ["workplace", "مقر العمل"],
      ["employmentType", "نوع التعيين"], ["phone", "هاتف العمل"], ["hireDate", "تاريخ التعيين", "date"], ["status", "الحالة"],
      ["training", "التدريب والمهارات"], ["notes", "ملاحظات"],
    ],
  },
  lined_canal: {
    sheet: "الترع_المبطنة", required: ["adm", "projectName", "canalName"],
    fields: [
      ["adm", "الإدارة"], ["projectName", "اسم المشروع"], ["canalName", "اسم الترعة"], ["eng", "الهندسة"], ["contractNumber", "رقم العقد"],
      ["startKm", "من كم", "number"], ["endKm", "إلى كم", "number"], ["lengthKm", "الطول كم", "number"], ["liningType", "نوع التبطين"],
      ["contractor", "الشركة المنفذة"], ["consultant", "جهة الإشراف"], ["fundingSource", "جهة التمويل"], ["contractValue", "القيمة التعاقدية", "number"],
      ["startDate", "تاريخ البدء", "date"], ["plannedFinish", "الانتهاء المخطط", "date"], ["actualFinish", "الانتهاء الفعلي", "date"],
      ["progressPercent", "نسبة التنفيذ %", "number", 0, 100], ["status", "الموقف التنفيذي"], ["provisionalAcceptanceDate", "الاستلام الابتدائي", "date"],
      ["warrantyEndDate", "نهاية الضمان", "date"], ["defects", "الملاحظات والعيوب"], ["latitude", "دائرة العرض", "number", -90, 90],
      ["longitude", "خط الطول", "number", -180, 180], ["documentUrl", "رابط المستند"], ["notes", "ملاحظات"],
    ],
  },
};

function doGet() {
  return json_({
    ok: true,
    service: "irrigation-sector-admins-sync",
    apiVersion: API_VERSION,
    platformVersion: 6,
    entityTypes: Object.keys(ENTITY_DEFINITIONS),
    time: new Date().toISOString(),
  });
}

function doPost(event) {
  try {
    const body = JSON.parse((event && event.postData && event.postData.contents) || "{}");
    if (body.action !== "sync") throw new Error("UNSUPPORTED_ACTION");
    if (Number(body.apiVersion) !== API_VERSION) throw new Error("UNSUPPORTED_API_VERSION");
    verifyKey_(body.key);
    return json_(sync_(body));
  } catch (error) {
    return json_({
      ok: false,
      error: String(error && error.message ? error.message : error),
      apiVersion: API_VERSION,
      serverTime: new Date().toISOString(),
    });
  }
}

function sync_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    spreadsheet.setSpreadsheetTimeZone("Africa/Cairo");
    const sheets = ensureSchema_(spreadsheet);
    const rows = readChanges_(sheets.changes);
    const byRecord = new Map();
    const byChange = new Map();
    rows.forEach(function (entry) {
      byRecord.set(entry.change.recordId, entry);
      byChange.set(entry.change.changeId, entry);
    });

    const incoming = Array.isArray(body.changes) ? body.changes.slice(0, 50) : [];
    const accepted = [];
    const conflicts = [];
    const user = safeText_(body.user, 120) || "غير مسجل";
    const deviceId = safeText_(body.deviceId, 160) || "unknown-device";

    incoming.forEach(function (raw) {
      const changeId = safeText_(raw.changeId, 160);
      const recordId = safeText_(raw.recordId, 180);
      const operation = raw.operation === "delete" ? "delete" : "upsert";
      const entityType = normalizeEntityType_(raw.entityType);
      if (!changeId || !recordId) throw new Error("INVALID_CHANGE_ID");

      const repeated = byChange.get(changeId);
      if (repeated) {
        accepted.push(repeated.change);
        return;
      }

      const current = byRecord.get(recordId);
      const currentVersion = current ? current.change.version : 0;
      const baseVersion = Number(raw.baseVersion) || 0;
      if (baseVersion !== currentVersion) {
        const conflict = {
          changeId: changeId,
          recordId: recordId,
          message: "يوجد تعديل أحدث على جهاز آخر",
          server: current ? current.change : null,
        };
        conflicts.push(conflict);
        appendAudit_(sheets.audit, raw, user, deviceId, "conflict", currentVersion, conflict.message);
        return;
      }

      const payload = sanitizeRecord_(entityType, raw.payload || {}, recordId, operation);
      const serverChange = {
        changeId: changeId,
        recordId: recordId,
        operation: operation,
        entityType: entityType,
        payload: payload,
        baseVersion: baseVersion,
        version: currentVersion + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: user,
        deviceId: deviceId,
        deleted: operation === "delete",
      };
      serverChange.checksum = checksum_(serverChange);
      const rowValues = changeToRow_(serverChange);
      if (current) {
        sheets.changes.getRange(current.row, 1, 1, CHANGE_HEADERS.length).setValues([rowValues]);
      } else {
        sheets.changes.appendRow(rowValues);
      }
      const rowNumber = current ? current.row : sheets.changes.getLastRow();
      const entry = { row: rowNumber, change: serverChange };
      byRecord.set(recordId, entry);
      byChange.set(changeId, entry);
      accepted.push(serverChange);
      appendAudit_(sheets.audit, serverChange, user, deviceId, "accepted", serverChange.version, "تم الحفظ");
      updateEntityView_(sheets.views[entityType], serverChange, ENTITY_DEFINITIONS[entityType]);
    });

    SpreadsheetApp.flush();
    const serverTime = new Date().toISOString();
    const sinceTime = body.since ? Date.parse(body.since) : NaN;
    const changes = [];
    byRecord.forEach(function (entry) {
      const updated = Date.parse(entry.change.updatedAt);
      if (!Number.isFinite(sinceTime) || !Number.isFinite(updated) || updated >= sinceTime) {
        changes.push(entry.change);
      }
    });
    changes.sort(function (a, b) { return a.updatedAt.localeCompare(b.updatedAt); });

    return {
      ok: true,
      apiVersion: API_VERSION,
      serverTime: serverTime,
      accepted: accepted,
      conflicts: conflicts,
      changes: changes,
    };
  } finally {
    lock.releaseLock();
  }
}

function ensureSchema_(spreadsheet) {
  const changes = ensureSheet_(spreadsheet, CHANGES_SHEET, CHANGE_HEADERS);
  const audit = ensureSheet_(spreadsheet, AUDIT_SHEET, AUDIT_HEADERS);
  const views = {};
  Object.keys(ENTITY_DEFINITIONS).forEach(function (entityType) {
    const definition = ENTITY_DEFINITIONS[entityType];
    views[entityType] = ensureEntityView_(spreadsheet, definition);
  });
  return { changes: changes, audit: audit, views: views };
}

function ensureEntityView_(spreadsheet, definition) {
  const headers = ["record_id"].concat(definition.fields.map(function (field) { return field[1]; })).concat(["version", "updated_at", "updated_by"]);
  const sheet = spreadsheet.getSheetByName(definition.sheet) || spreadsheet.insertSheet(definition.sheet);
  const existing = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  const valid = headers.every(function (header, index) { return existing[index] === header; });
  if (!valid) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#e5f3f5")
      .setFontColor("#083344")
      .setFontWeight("bold")
      .setWrap(true);
    sheet.setColumnWidth(1, 210);
    for (let column = 2; column <= Math.min(headers.length, 20); column++) sheet.setColumnWidth(column, 145);
  }
  sheet.setFrozenRows(1);
  sheet.setRightToLeft(true);
  sheet.setHiddenGridlines(true);
  return sheet;
}

function ensureSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  const existing = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  const valid = headers.every(function (header, index) { return existing[index] === header; });
  if (!valid) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.setRightToLeft(true);
  return sheet;
}

function readChanges_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, CHANGE_HEADERS.length).getValues()
    .map(function (row, index) {
      try {
        return { row: index + 2, change: rowToChange_(row) };
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
}

function rowToChange_(row) {
  return {
    changeId: String(row[0] || ""),
    recordId: String(row[1] || ""),
    operation: row[2] === "delete" ? "delete" : "upsert",
    entityType: normalizeEntityType_(row[3]),
    payload: JSON.parse(String(row[4] || "{}")),
    baseVersion: Number(row[5]) || 0,
    version: Number(row[6]) || 0,
    updatedAt: row[7] instanceof Date ? row[7].toISOString() : String(row[7] || ""),
    updatedBy: String(row[8] || ""),
    deviceId: String(row[9] || ""),
    deleted: row[10] === true || String(row[10]).toLowerCase() === "true",
    checksum: String(row[11] || ""),
  };
}

function changeToRow_(change) {
  return [
    change.changeId,
    change.recordId,
    change.operation,
    change.entityType,
    JSON.stringify(change.payload),
    change.baseVersion,
    change.version,
    new Date(change.updatedAt),
    change.updatedBy,
    change.deviceId,
    change.deleted,
    change.checksum,
  ];
}

function appendAudit_(sheet, change, user, deviceId, status, version, message) {
  sheet.appendRow([
    Utilities.getUuid(),
    safeText_(change.changeId, 160),
    change.operation === "delete" ? "delete" : "upsert",
    safeText_(change.recordId, 180),
    JSON.stringify(change.payload || {}),
    new Date(),
    user,
    deviceId,
    status,
    version,
    message,
    normalizeEntityType_(change.entityType),
  ]);
}

function normalizeEntityType_(value) {
  const entityType = safeText_(value || "asset", 40);
  return ENTITY_DEFINITIONS[entityType] ? entityType : "asset";
}

function sanitizeRecord_(entityType, payload, recordId, operation) {
  const definition = ENTITY_DEFINITIONS[entityType];
  const record = { recordId: recordId, entityType: entityType };
  definition.fields.forEach(function (field) {
    const key = field[0];
    const kind = field[2] || "text";
    if (kind === "number") {
      record[key] = nullableNumber_(payload[key], typeof field[3] === "number" ? field[3] : 0, typeof field[4] === "number" ? field[4] : 1000000000000);
    } else if (kind === "date") {
      record[key] = safeText_(payload[key], 30);
    } else {
      record[key] = safeText_(payload[key], key === "notes" || key === "description" || key === "training" ? 1200 : 700);
    }
  });
  if (operation !== "delete") {
    definition.required.forEach(function (key) {
      if (record[key] === "" || record[key] === null || typeof record[key] === "undefined") throw new Error("MISSING_REQUIRED_FIELD_" + key);
    });
  }
  return record;
}

function updateEntityView_(sheet, change, definition) {
  const match = sheet.createTextFinder(change.recordId).matchEntireCell(true).findNext();
  if (change.deleted) {
    if (match && match.getRow() > 1) sheet.deleteRow(match.getRow());
    return;
  }
  const row = [change.recordId]
    .concat(definition.fields.map(function (field) { return change.payload[field[0]]; }))
    .concat([change.version, new Date(change.updatedAt), change.updatedBy]);
  if (match && match.getRow() > 1) {
    sheet.getRange(match.getRow(), 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function nullableNumber_(value, min, max) {
  if (value === "" || value === null || typeof value === "undefined") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) throw new Error("INVALID_NUMBER");
  return number;
}

function safeText_(value, maxLength) {
  return String(value === null || typeof value === "undefined" ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLength);
}

function checksum_(change) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify([change.recordId, change.operation, change.payload, change.version, change.updatedAt]),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function (byte) {
    const value = byte < 0 ? byte + 256 : byte;
    return ("0" + value.toString(16)).slice(-2);
  }).join("");
}

function verifyKey_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty("SYNC_KEY");
  if (!expected) throw new Error("SYNC_KEY_NOT_CONFIGURED");
  if (!constantTimeEqual_(String(provided || ""), expected)) throw new Error("UNAUTHORIZED");
}

function constantTimeEqual_(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
