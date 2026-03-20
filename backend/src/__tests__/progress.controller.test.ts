import type { Request, Response } from "express"
import { saveInitialTest } from "../controllers/progress.controller"

// mocks
const mockFindOne = jest.fn()
const mockSave = jest.fn()

// jest.mock will be hoisted, so define the mock class inside the factory
jest.mock("../models/UserProgress", () => {
  return class {
    static findOne = (...args: any[]) => mockFindOne(...args)
    cigarettesPerDay: number
    packagePrice: number
    dependencyLevel: string
    fagerstromScore?: number
    motivations?: string[]
    constructor(data?: any) {
      Object.assign(this, data)
      this.save = mockSave
    }
    save = mockSave
  }
})

// we also need to mock DailyPlan since saveInitialTest invokes createInitialDailyPlan which uses DailyPlan model.
jest.mock("../models/DailyPlan", () => {
  return jest.fn().mockImplementation(() => ({ save: jest.fn() }))
})



describe("Progress Controller", () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: jest.Mock
  let mockJson: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })
    mockRequest = { body: {} }
    mockResponse = { status: mockStatus, json: mockJson }
  })

  test("should return 401 if user not authenticated", async () => {
    mockRequest = { body: {}, headers: {} }
    await saveInitialTest(mockRequest as Request, mockResponse as Response)
    expect(mockStatus).toHaveBeenCalledWith(401)
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: "Usuario no autenticado",
    })
  })

  test("should return 400 if progress already exists", async () => {
    mockRequest = { userId: "user1", body: {} }
    mockFindOne.mockResolvedValue({})
    await saveInitialTest(mockRequest as any, mockResponse as Response)
    expect(mockStatus).toHaveBeenCalledWith(400)
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: "Ya existe un test inicial para este usuario",
    })
  })

  test("should save new progress when none exists", async () => {
    mockRequest = { userId: "user1", body: { cigarettesPerDay: 10, packagePrice: 5, dependencyLevel: "Leve" } }
    mockFindOne.mockResolvedValue(null)

    // call controller
    await saveInitialTest(mockRequest as any, mockResponse as Response)

    // our mockSave should have been called during creation
    expect(mockSave).toHaveBeenCalled()
    expect(mockStatus).toHaveBeenCalledWith(201)
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Test inicial guardado correctamente",
    }))
  })

  test("should normalize friendly dependency level strings", async () => {
    mockRequest = {
      userId: "user2",
      body: { cigarettesPerDay: 5, packagePrice: 3, dependencyLevel: "Dependencia Baja" },
    }
    mockFindOne.mockResolvedValue(null)

    await saveInitialTest(mockRequest as any, mockResponse as Response)

    // Even though the body contained a friendly label, the controller should still save
    expect(mockSave).toHaveBeenCalled()
    expect(mockStatus).toHaveBeenCalledWith(201)
  })
})
