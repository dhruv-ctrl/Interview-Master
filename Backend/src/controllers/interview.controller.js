const interviewReportModel = require("../models/interviewReport.model");
const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")

async function generateInterviewReportController(req, res) {


    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded"
        });
    }

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()


    const { selfDescription, jobDescription } = req.body

    let interviewReportByAi;

    try { interviewReportByAi = await generateInterviewReport({ resume: resumeContent.text, selfDescription, jobDescription }) }
    catch (err) {
        return res.status(503).json({
            message: "AI service is temporarily unavailable. Please try again."
        });
    }


    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    })
}

async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview Report not found"
        })
    }

    res.status(200).json({
        message: "Interview report fetched succcessfully",
        interviewReport
    })

}

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports
    })
}

async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById({ _id: interviewReportId })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview Report not found"
        })
    }

    const { resume, selfDescription, jobDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment;filename = resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)

}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}