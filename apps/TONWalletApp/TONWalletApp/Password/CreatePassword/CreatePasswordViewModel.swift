//
//  CreatePasswordViewModel.swift
//  TONWalletApp
//
//  Created by Nikita Rodionov on 06.10.2025.
//

import Foundation
import LocalAuthentication

@MainActor
class CreatePasswordViewModel: ObservableObject {
    @Published var password = ""
    @Published var confirmPassword = ""
    
    private let passwordStorage = PasswordStorage()
    
    var isPasswordValid: Bool {
        password.count >= 8 &&
        password.contains(where: { $0.isUppercase }) &&
        password.contains(where: { $0.isLowercase }) &&
        password.contains(where: { $0.isNumber })
    }
    
    var passwordsMatch: Bool {
        !confirmPassword.isEmpty && password == confirmPassword
    }
    
    var canContinue: Bool {
        isPasswordValid && passwordsMatch
    }
    
    func `continue`(_ completion: @escaping (Bool) -> ()) {
        guard canContinue else {
            completion(false)
            return
        }
        
        do {
            try passwordStorage.set(password: password)
            
            requestBiometry {
                completion(true)
            }
        } catch {
            debugPrint(error.localizedDescription)
            completion(false)
        }
    }
    
    private func requestBiometry(_ completion: @escaping () -> Void) {
        let context = LAContext()
        var error: NSError?
        
        let canEvaluate = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        
        if canEvaluate {
            completion()
        } else if let error, error.code == LAError.biometryNotEnrolled.rawValue {
            context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: "This app uses Face ID to authenticate the user."
            ) { success, _ in
                DispatchQueue.main.async {
                    completion()
                }
            }
        } else {
            completion()
        }
    }
}
